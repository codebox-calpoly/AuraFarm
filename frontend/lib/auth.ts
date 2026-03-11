import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'session_access_token';
const REFRESH_TOKEN_KEY = 'session_refresh_token';
const USER_ID_KEY = 'session_user_id';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  userId: string | number;
}

export async function storeSession(session: {
  accessToken: string;
  refreshToken: string;
  userId: string |number;
}): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, session.accessToken],
      [REFRESH_TOKEN_KEY, session.refreshToken],
      [USER_ID_KEY, String(session.userId)],
    ]);
  } catch (error) {
    console.error('Error storing session:', error);
  }
}

export async function getSession(): Promise<StoredSession | null> {
  try {
    const values = await AsyncStorage.multiGet([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_ID_KEY,
    ]);
    const accessToken = values[0][1];
    const refreshToken = values[1][1];
    const userId = values[2][1];

    if (!accessToken || !refreshToken || !userId) return null;

    return {
      accessToken,
      refreshToken,
      userId: parseInt(userId, 10),
    };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_ID_KEY,
    ]);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/** @deprecated Use storeSession instead */
export async function setAuthenticated(value: boolean): Promise<void> {
  if (!value) await clearSession();
}
