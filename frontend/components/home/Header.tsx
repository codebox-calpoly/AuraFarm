import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function Header() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.logoText}>
        Aura Farm
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  logoText: {
    fontFamily: 'System', // Using system font effectively as a placeholder for the custom font in the design
    fontSize: 28,
    fontWeight: '800',
    color: '#FF0000', // Red color from design
    // textShadowColor: 'rgba(0, 0, 0, 0.1)',
    // textShadowOffset: { width: 1, height: 1 },
    // textShadowRadius: 2,
  },
});
