import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function RanksScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Ranks</ThemedText>
      <ThemedText>Leaderboard and ranking coming soon...</ThemedText>
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
