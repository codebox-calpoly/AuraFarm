import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { tailwindColors } from '@/constants/tailwind-colors';

interface TabSwitcherProps {
  activeTab: 'my-challenges' | 'feed';
  onTabChange: (tab: 'my-challenges' | 'feed') => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tab} 
        onPress={() => onTabChange('my-challenges')}
      >
        <ThemedText 
          style={[
            styles.tabText, 
            activeTab === 'my-challenges' && styles.activeTabText
          ]}
        >
          My Challenges
        </ThemedText>
        {activeTab === 'my-challenges' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tab} 
        onPress={() => onTabChange('feed')}
      >
        <ThemedText 
          style={[
            styles.tabText, 
            activeTab === 'feed' && styles.activeTabText
          ]}
        >
          Feed
        </ThemedText>
        {activeTab === 'feed' && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 20,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: tailwindColors['aura-gray-400'],
  },
  activeTabText: {
    fontFamily: 'Poppins_700Bold',
    color: tailwindColors['aura-black'],
  },
  activeIndicator: {
    height: 2,
    width: '100%',
    backgroundColor: tailwindColors['aura-black'],
    marginTop: 4,
  },
});
