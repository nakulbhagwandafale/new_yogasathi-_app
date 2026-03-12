import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const STEPS = [
    {
        id: '01',
        title: 'Complete Your Assessment',
        desc: 'Share your fitness level, health goals, and experience. We use this to understand where you are on your journey.',
        icon: 'clipboard-outline',
        color: '#3b82f6', // blue
        bg: '#eff6ff',
    },
    {
        id: '02',
        title: 'AI Generates Your Plan',
        desc: 'Our Gemini-powered AI creates a tailored daily yoga routine and nutrition guide specifically for your needs.',
        icon: 'hardware-chip-outline',
        color: '#8b5cf6', // purple
        bg: '#f5f3ff',
    },
    {
        id: '03',
        title: 'Daily Practice',
        desc: 'Follow your personalized plan each day. View detailed instructions, track calories, and focus on consistency.',
        icon: 'body-outline',
        color: '#10b981', // green
        bg: '#ecfdf5',
    },
    {
        id: '04',
        title: 'Reflect & Grow',
        desc: 'Log your feelings and progress. Our AI provides a summary report and adapts your future sessions.',
        icon: 'journal-outline',
        color: '#f59e0b', // amber
        bg: '#fffbeb',
    },
];

export default function HowItWorks() {
    const { theme } = useTheme();

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            {/* Top Bar */}
            <View style={[styles.topBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: theme.text }]}>How It Works</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Hero Section */}
                <View style={styles.heroWrapper}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80' }} // User provided meditating woman image
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={[styles.heroOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                    <View style={styles.heroContent}>
                        <View style={[styles.heroIconCircle, { backgroundColor: theme.primary }]}>
                            <Ionicons name="bulb-outline" size={28} color="#fff" />
                        </View>
                        <Text style={styles.heroTitle}>Your Journey</Text>
                        <Text style={styles.heroSubtitle}>4 simple steps to a better you</Text>
                    </View>
                </View>

                {/* Steps Timeline */}
                <View style={styles.timelineBlock}>
                    {STEPS.map((step, index) => (
                        <View key={step.id} style={styles.stepContainer}>
                            
                            {/* Left Line */}
                            {index !== STEPS.length - 1 && (
                                <View style={[styles.timelineLine, { backgroundColor: theme.divider }]} />
                            )}

                            <View style={styles.stepRow}>
                                {/* Step Icon */}
                                <View style={[styles.stepIconWrap, { backgroundColor: step.bg, borderColor: step.color }]}>
                                    <Ionicons name={step.icon} size={22} color={step.color} />
                                </View>

                                {/* Step Content */}
                                <View style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                    <View style={styles.stepCardHeader}>
                                        <Text style={[styles.stepNumber, { color: theme.primaryLight }]}>Step {step.id}</Text>
                                    </View>
                                    <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
                                    <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>{step.desc}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Bottom CTA */}
                <View style={[styles.ctaBlock, { backgroundColor: theme.accent, borderColor: theme.border }]}>
                    <Text style={[styles.ctaTitle, { color: theme.text }]}>Ready to start?</Text>
                    <Text style={[styles.ctaDesc, { color: theme.textSecondary }]}>
                        Let YogaSathi be your personal guide to mindfulness and wellness.
                    </Text>
                    <TouchableOpacity
                        style={[styles.ctaBtn, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.ctaBtnText}>Get Started Let's Go!</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // Top Bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    topBarTitle: { fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

    container: { paddingBottom: 40 },

    // Hero
    heroWrapper: { width: '100%', height: 220, position: 'relative', overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // dark overlay for text readability
    },
    heroContent: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    heroIconCircle: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6, letterSpacing: 0.5 },
    heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },

    // Timeline
    timelineBlock: { paddingHorizontal: 20, paddingTop: 24 },
    stepContainer: { position: 'relative', marginBottom: 20 },
    timelineLine: {
        position: 'absolute',
        left: 21, // Center of the 44px icon
        top: 44,
        bottom: -20,
        width: 2,
        zIndex: 0,
    },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
    stepIconWrap: {
        width: 44, height: 44, borderRadius: 22,
        borderWidth: 2,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16,
        zIndex: 1, // Stay above the line
    },
    stepCard: {
        flex: 1, borderRadius: 14, borderWidth: 1,
        padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    stepCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    stepNumber: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    stepTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    stepDesc: { fontSize: 14, lineHeight: 21 },

    // CTA Bottom
    ctaBlock: {
        marginHorizontal: 20, marginTop: 10,
        borderRadius: 16, borderWidth: 1,
        padding: 24, alignItems: 'center',
    },
    ctaTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
    ctaDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 20 },
    ctaBtn: {
        flexDirection: 'row',
        paddingHorizontal: 24, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2e7d32', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 5, elevation: 5,
    },
    ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
