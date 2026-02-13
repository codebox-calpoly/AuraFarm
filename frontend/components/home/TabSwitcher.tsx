import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface TabSwitcherProps {
  activeTab: 'my-challenges' | 'feed';
  onTabChange: (tab: 'my-challenges' | 'feed') => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <View className="flex-row justify-center gap-10 mb-5">
      <TouchableOpacity 
        className="items-center py-2" 
        onPress={() => onTabChange('my-challenges')}
      >
        <ThemedText 
          className={`text-base ${activeTab === 'my-challenges' ? 'font-bold text-aura-black' : 'font-semibold text-gray-400'}`}
        >
          My Challenges
        </ThemedText>
        {activeTab === 'my-challenges' && <View className="h-0.5 w-full bg-aura-black mt-1" />}
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="items-center py-2" 
        onPress={() => onTabChange('feed')}
      >
        <ThemedText 
          className={`text-base ${activeTab === 'feed' ? 'font-bold text-aura-black' : 'font-semibold text-gray-400'}`}
        >
          Feed
        </ThemedText>
        {activeTab === 'feed' && <View className="h-0.5 w-full bg-aura-black mt-1" />}
      </TouchableOpacity>
    </View>
  );
}
