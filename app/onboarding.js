import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: 1,
        title: 'Personalized Yoga for\nYour Body & Mind',
        description: 'Tailored sessions that adapt to your progress\nand energy levels.',
        image: require('../assets/images/onboarding1.png'),
    },
    {
        id: 2,
        title: 'Daily AI Wellness\nReports',
        description: 'Get deep insights into your sleep,\nstress, and physical health with\npersonalized AI-driven data.',
        image: require('../assets/images/onboarding2.png'),
    },
    {
        id: 3,
        title: 'Complete Holistic\nWellness',
        description: 'Your journey to a balanced life starts\nhere, guided by AI.',
        image: require('../assets/images/onboarding3.png'),
    }
];

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const insets = useSafeAreaInsets();

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('@onboarding_complete', 'true');
        } catch (e) {
            console.warn('Failed to save onboarding status', e);
        }
        router.replace('/signup');
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const activeSlide = slides[currentIndex];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 50) }]}>
                {currentIndex === 0 ? (
                    <TouchableOpacity onPress={completeOnboarding} style={styles.headerIcon}>
                        <Ionicons name="close" size={24} color="#1f2937" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleBack} style={styles.headerIcon}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                )}
                
                <Text style={styles.headerTitle}>YogaSathi</Text>
                
                {/* Empty view to balance the header flex */}
                <View style={styles.headerIcon} />
            </View>

            {/* Image */}
            <View style={styles.imageContainer}>
                <Image 
                    source={activeSlide.image} 
                    style={styles.image} 
                    resizeMode="cover" 
                />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{activeSlide.title}</Text>
                <Text style={styles.description}>{activeSlide.description}</Text>
            </View>

            {/* Bottom Section */}
            <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {/* Pagination Dots */}
                <View style={styles.dotsContainer}>
                    {slides.map((_, index) => (
                        <View 
                            key={index} 
                            style={[
                                styles.dot, 
                                currentIndex === index && styles.activeDot
                            ]} 
                        />
                    ))}
                </View>

                {/* Primary Button */}
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                </TouchableOpacity>

                {/* Footer Text / Skip */}
                <View style={styles.footerContainer}>
                    {currentIndex < 2 ? (
                        <TouchableOpacity onPress={completeOnboarding}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.trustBadge}>
                            <Ionicons name="shield-checkmark" size={14} color="#6b7280" />
                            <Text style={styles.trustText}>Join 50,000+ mindful practitioners</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#f8f9fa',
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    // Image area
    imageContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    image: {
        width: '100%',
        height: height * 0.45,
        borderRadius: 35,
    },
    // Text area
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: 35,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 34,
    },
    description: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    // Bottom area
    bottomSection: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 25,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 4,
    },
    activeDot: {
        width: 20,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4bb543',
    },
    button: {
        backgroundColor: '#4bb543',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#4bb543',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonIcon: {
        marginLeft: 8,
    },
    footerContainer: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    skipText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '500',
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trustText: {
        color: '#6b7280',
        fontSize: 13,
        marginLeft: 6,
    },
});
