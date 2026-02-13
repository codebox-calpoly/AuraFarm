import { StyleSheet, View, TouchableOpacity } from 'react-native';
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
        <ThemedView style={styles.container}>
            {/* Header with title, Aura, and options menu */}
            <View style={styles.header}>
                <View style={styles.optionsButton} />
                <View style={styles.titleSection}>
                    <ThemedText style={styles.challengeTitle}>
                        {challengeTitle}
                    </ThemedText>
                    <ThemedText style={styles.pointsText}>
                        +{points} Aura
                    </ThemedText>
                </View>
                <TouchableOpacity onPress={onOptionsPress} style={styles.optionsButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color={tailwindColors['aura-black']} />
                </TouchableOpacity>
            </View>

            {/* Image */}
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                <View style={styles.imageContainer}>
                    {userImage ? (
                        <Image
                            source={{ uri: userImage }}
                            style={styles.image}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={48} color={tailwindColors['aura-gray-400']} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* User info and caption */}
            <View style={styles.contentSection}>
                <ThemedText style={styles.userName}>
                    {userName}
                </ThemedText>
                {caption && (
                    <ThemedText style={styles.caption}>
                        {caption}
                    </ThemedText>
                )}
                <ThemedText style={styles.dateText}>
                    {date}
                </ThemedText>
            </View>

            {/* Likes */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={onLikePress} style={styles.likeButton}>
                    <Ionicons name="heart-outline" size={20} color={tailwindColors['aura-black']} />
                    <ThemedText style={styles.likesText}>
                        {likes}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: tailwindColors['aura-white'],
        borderRadius: 16,
        borderWidth: 2,
        borderColor: tailwindColors['aura-black'],
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: tailwindColors['aura-black'],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    titleSection: {
        flex: 1,
        alignItems: 'center',
    },
    challengeTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: tailwindColors['aura-black'],
        marginBottom: 4,
        textAlign: 'center',
    },
    pointsText: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: tailwindColors['aura-yellow'],
        textAlign: 'center',
    },
    optionsButton: {
        padding: 4,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: tailwindColors['aura-gray-100'],
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: tailwindColors['aura-gray-100'],
    },
    contentSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    userName: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: tailwindColors['aura-red'],
        marginBottom: 4,
    },
    caption: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: tailwindColors['aura-black'],
        marginBottom: 4,
        lineHeight: 20,
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: tailwindColors['aura-gray-400'],
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    likesText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: tailwindColors['aura-black'],
    },
});
