import { View, Image, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');

                // Add logging to debug
                console.log('Current onboarding status:', hasCompletedOnboarding);

                setTimeout(() => {
                    // just for debugging: Force navigation to onboarding
                    // if (hasCompletedOnboarding === 'true') {
                    //     router.replace('/(tabs)');
                    // } else {
                    router.replace('/onboarding');
                    // }
                }, 2000);
            } catch (error) {
                console.error('Error checking onboarding status:', error);
                router.replace('/onboarding');
            }
        };

        checkOnboarding();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeIn.duration(800)}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DC2626', // red-600
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 128,
        height: 128,
    },
});
