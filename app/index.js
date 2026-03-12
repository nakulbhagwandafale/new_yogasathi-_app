import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkAssessmentExists, getSession } from '../services/supabaseClient';

export default function Index() {
    const [progressText, setProgressText] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    
    // We will determine the destination route in the background, but wait for animation to finish.
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        // Start the progress animation (simulates a 2.5 second loading period)
        Animated.timing(progressAnim, {
            toValue: 100,
            duration: 2500,
            useNativeDriver: false,
        }).start();

        // Update the percentage text during animation
        progressAnim.addListener(({ value }) => {
            setProgressText(Math.floor(value));
        });

        // Run the background authentication checks
        async function checkNavigation() {
            try {
                const onboarded = await AsyncStorage.getItem('@onboarding_complete');
                if (onboarded !== 'true') {
                    setDestination('/onboarding');
                    return;
                }

                const sessionResult = await getSession();
                if (!sessionResult.success || !sessionResult.data) {
                    setDestination('/login');
                    return;
                }

                const assessmentResult = await checkAssessmentExists();
                if (assessmentResult.exists) {
                    setDestination('/(tabs)/home');
                } else {
                    setDestination('/assessment');
                }
            } catch (e) {
                setDestination('/onboarding');
            }
        }

        checkNavigation();

        return () => progressAnim.removeAllListeners();
    }, []);

    // When both the animation is complete (progressText === 100) and the destination is known, navigate.
    useEffect(() => {
        if (progressText === 100 && destination) {
            // Small delay to let the user see 100% completion
            setTimeout(() => {
                router.replace(destination);
            }, 300);
        }
    }, [progressText, destination]);

    // Calculate progress bar width
    const progressBarWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            {/* Center Content */}
            <View style={styles.centerContent}>
                <View style={styles.iconRing}>
                    <Ionicons name="leaf" size={60} color="#4bb543" style={styles.leafIcon} />
                </View>
                <Text style={styles.title}>YogaSathi</Text>
                <Text style={styles.subtitle}>Your AI Wellness Companion</Text>
            </View>

            {/* Bottom Content / Progress */}
            <View style={styles.bottomContent}>
                <View style={styles.progressTextRow}>
                    <Text style={styles.loadingText}>Initializing serenity...</Text>
                    <Text style={styles.percentageText}>{progressText}%</Text>
                </View>
                
                <View style={styles.progressBarBackground}>
                    <Animated.View style={[styles.progressBarFill, { width: progressBarWidth }]} />
                </View>

                <View style={styles.footerRow}>
                    <Ionicons name="sparkles" size={12} color="#a5d6a7" />
                    <Text style={styles.footerText}>POWERED BY YOGA AI</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4fbf7', // Soft green background shown in the screenshot
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: '#a5d6a7',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#fff',
    },
    leafIcon: {
        transform: [{ rotate: '-15deg' }], // Slight tilt for the leaf icon to match the design
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
    },
    bottomContent: {
        width: '100%',
        paddingHorizontal: 40,
        paddingBottom: 50,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    loadingText: {
        fontSize: 13,
        color: '#4bb543',
        fontWeight: '600',
    },
    percentageText: {
        fontSize: 13,
        color: '#4bb543',
        fontWeight: '600',
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4bb543',
        borderRadius: 3,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    footerText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#a5d6a7',
        letterSpacing: 1.5,
        marginLeft: 6,
    },
});
