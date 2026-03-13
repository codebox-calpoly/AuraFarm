import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SESSION_KEY = '@aurafarm/session';

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
  if (!exp) return false;
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

export async function storeSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Sync to Supabase so storage uploads work (uses same tokens)
  try {
    await supabase.auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
  } catch {
    // Supabase may not be configured; auth still works via backend
  }
}

export async function refreshSession(): Promise<Session | null> {
  const current = await getSession();
  if (!current?.refreshToken) return null;
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: current.refreshToken,
    });
    if (error || !data.session) return null;
    const refreshed: Session = {
      ...current,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
    await storeSession(refreshed);
    return refreshed;
  } catch {
    return null;
  }
}

export async function getValidSession(): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;
  if (isTokenExpired(session.accessToken)) {
    const refreshed = await refreshSession();
    return refreshed;
  }
  return session;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  if (session?.accessToken) return true;
  try {
    const { data: { session: sb } } = await supabase.auth.getSession();
    return !!sb;
  } catch {
    return false;
  }
}

export async function setAuthenticated(value: boolean): Promise<void> {
  if (!value) await clearSession();
}
