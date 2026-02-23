import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText>User profile and application settings coming soon...</ThemedText>
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
});
