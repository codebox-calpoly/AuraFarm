import { supabase } from './supabase';

export async function isAuthenticated(): Promise<boolean> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}

// Note: setAuthenticated is deprecated in favor of using supabase directly.
// We keep it temporarily to resolve any lingering imports while we refactor.
export async function setAuthenticated(value: boolean): Promise<void> {
  if (!value) {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
