import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { setAuthenticated } from '@/lib/auth';
import { tailwindColors } from '@/constants/tailwind-colors';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogOut = async () => {
    await setAuthenticated(false);
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText>User profile and application settings coming soon...</ThemedText>
      <TouchableOpacity style={styles.logOutButton} onPress={handleLogOut}>
        <ThemedText style={styles.logOutText}>Log Out</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logOutButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: tailwindColors['aura-red'],
    borderRadius: 12,
  },
  logOutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
