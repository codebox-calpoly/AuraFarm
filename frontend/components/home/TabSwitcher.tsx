import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

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
          lightColor={activeTab === 'my-challenges' ? '#000' : '#9CA3AF'}
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
          lightColor={activeTab === 'feed' ? '#000' : '#9CA3AF'}
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
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  activeIndicator: {
    height: 2,
    width: '100%',
    backgroundColor: '#000',
    marginTop: 4,
  },
});
