import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SESSION_KEY = '@aurafarm/session';
const EXPLICIT_AUTH_KEY = '@aurafarm/explicit-auth-completed';

export type Session = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  user?: { id: number; email: string; name: string; auraPoints?: number; streak?: number };
};

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (!exp) return true;
  return Date.now() / 1000 > exp - 30; // 30 second buffer
}

export async function getSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.accessToken || !parsed?.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isInvalidRefreshError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  return (
    lower.includes('invalid refresh token') ||
    lower.includes('already used') ||
    lower.includes('invalid_grant') ||
    lower.includes('refresh token not found')
  );
}

/**
 * Puts the current stored tokens into the in-memory Supabase client (we disabled
 * persistSession so this must run after a cold start before refresh/upload flows).
 * Returns false if storage was cleared (e.g. invalid / reused refresh token).
 */
export async function rehydrateSupabaseClient(session: Session): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
    if (error) {
      if (isInvalidRefreshError(error)) {
        await clearSession();
      }
      return false;
    }
    if (!data.session) {
      await clearSession();
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      return false;
    }
    return true;
  } catch (err) {
    if (isInvalidRefreshError(err)) {
      await clearSession();
      return false;
    }
    return true;
  }
}

export async function storeSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Sync to Supabase so storage uploads work (uses same tokens)
  try {
    await rehydrateSupabaseClient(session);
  } catch {
    // Supabase may not be configured; auth still works via backend
  }
}

export async function hasCompletedExplicitAuth(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(EXPLICIT_AUTH_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function markExplicitAuthCompleted(): Promise<void> {
  await AsyncStorage.setItem(EXPLICIT_AUTH_KEY, 'true');
}

export async function refreshSession(): Promise<Session | null> {
  const current = await getSession();
  if (!current?.refreshToken) return null;
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: current.refreshToken,
    });
    if (error) {
      if (isInvalidRefreshError(error)) {
        await clearSession();
        await supabase.auth.signOut();
      }
      return null;
    }
    if (!data.session) {
      return null;
    }
    const refreshed: Session = {
      ...current,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
    await storeSession(refreshed);
    return refreshed;
  } catch (err) {
    if (isInvalidRefreshError(err)) {
      await clearSession();
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    return null;
  }
}

/**
 * Session usable for API calls and gating. If the access token is expired, tries a single
 * explicit refresh. If the refresh token is invalid or already used, storage is cleared and
 * this returns null so the app can send the user to sign in.
 */
export async function getValidSession(): Promise<Session | null> {
  const session = await getSession();
  if (!session?.userId || !session.accessToken) return null;

  if (isTokenExpired(session.accessToken)) {
    const refreshed = await refreshSession();
    if (refreshed) return refreshed;
    return null;
  }

  if (!(await rehydrateSupabaseClient(session))) {
    return null;
  }

  return (await getSession()) ?? null;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

/**
 * Same bar as `getValidSession()` — must not disagree or splash opens tabs while
 * screens using `getValidSession()` send you to login (phantom 0-aura shell).
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getValidSession()) !== null;
}

export async function setAuthenticated(value: boolean): Promise<void> {
  if (!value) await clearSession();
}
