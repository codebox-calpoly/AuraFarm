import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { tailwindColors } from '@/constants/tailwind-colors';

export interface FeedCardProps {
    challengeTitle: string;
    points: number;
    userName: string;
    userImage?: string; // URL or require() path
    caption?: string;
    date: string;
    likes: number;
    onPress?: () => void;
    onOptionsPress?: () => void;
    onLikePress?: () => void;
}

export function FeedCard({
    challengeTitle,
    points,
    userName,
    userImage,
    caption,
    date,
    likes,
    onPress,
    onOptionsPress,
    onLikePress,
}: FeedCardProps) {
    return (
        <ThemedView 
            className="bg-white rounded-2xl border-2 border-aura-black mb-5 overflow-hidden"
            style={{
                shadowColor: '#383737',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            {/* Header with title, Aura, and options menu */}
            <View className="flex-row justify-between items-start px-4 pt-4 pb-3">
                <View className="flex-1 items-center">
                    <ThemedText className="text-lg font-bold mb-1 text-center" style={{ color: tailwindColors['aura-black'] }}>
                        {challengeTitle}
                    </ThemedText>
                    <ThemedText className="text-sm font-semibold text-center" style={{ color: tailwindColors['aura-green'] }}>
                        +{points} Aura
                    </ThemedText>
                </View>
                <TouchableOpacity onPress={onOptionsPress} className="p-1">
                    <Ionicons name="ellipsis-vertical" size={20} color={tailwindColors['aura-black']} />
                </TouchableOpacity>
            </View>

            {/* Image */}
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                <View className="w-full aspect-square bg-gray-100">
                    {userImage ? (
                        <Image
                            source={{ uri: userImage }}
                            className="w-full h-full"
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-full h-full justify-center items-center bg-gray-100">
                            <Ionicons name="image-outline" size={48} color="#9CA3AF" /> 
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* User info and caption */}
            <View className="px-4 pt-3 pb-2">
                <ThemedText className="text-sm font-semibold mb-1" style={{ color: tailwindColors['aura-red'] }}>
                    {userName}
                </ThemedText>
                {caption && (
                    <ThemedText className="text-sm font-sans mb-1 leading-5" style={{ color: tailwindColors['aura-black'] }}>
                        {caption}
                    </ThemedText>
                )}
                <ThemedText className="text-xs font-sans mt-1" style={{ color: '#9CA3AF' }}>
                    {date}
                </ThemedText>
            </View>

            {/* Likes */}
            <View className="flex-row justify-end items-center px-4 pb-4 pt-2">
                <TouchableOpacity onPress={onLikePress} className="flex-row items-center gap-1.5">
                    <Ionicons name="heart-outline" size={20} color={tailwindColors['aura-black']} />
                    <ThemedText className="text-sm font-sans" style={{ color: tailwindColors['aura-black'] }}>
                        {likes}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}
