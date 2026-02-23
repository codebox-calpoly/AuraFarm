import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function AuraScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Aura</ThemedText>
      <ThemedText>Aura statistics and history coming soon...</ThemedText>
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
