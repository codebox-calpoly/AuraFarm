import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/themed-view';

export function Header() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/home-header.png')}
        style={styles.logo}
        contentFit="contain"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 200,
    height: 50,
  },
});
