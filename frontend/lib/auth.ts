import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'isLoggedIn';

export async function isAuthenticated(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(AUTH_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setAuthenticated(value: boolean): Promise<void> {
  try {
    if (value) {
      await AsyncStorage.setItem(AUTH_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(AUTH_KEY);
    }
  } catch (error) {
    console.error('Error setting auth state:', error);
  }
}
