import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const VALUES = [
    { icon: 'heart-outline', label: 'Compassion', color: '#ef4444' },
    { icon: 'star-outline', label: 'Authenticity', color: '#f59e0b' },
    { icon: 'people-outline', label: 'Community', color: '#3b82f6' },
    { icon: 'flash-outline', label: 'Innovation', color: '#8b5cf6' },
];

const STORY_ITEMS = [
    {
        icon: 'leaf-outline',
        title: 'Why We Started',
        desc: 'Born from a need to bridge ancient wisdom with modern technology, YogaSathi was created to solve the "one size fits all" problem in digital wellness.',
    },
    {
        icon: 'hardware-chip-outline',
        title: 'AI for Personalization',
        desc: 'Our proprietary AI analyzes your stress levels, posture, and goals to curate a daily practice that evolves as you do. It\'s not just an app; it\'s your digital companion.',
    },
];

export default function AboutUs() {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');

    const handleSubscribe = () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        Alert.alert('Subscribed! 🎉', 'Thank you for joining the YogaSathi community!');
        setEmail('');
    };

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Top Bar */}
            <View style={[styles.topBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: theme.text }]}>About YogaSathi</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={[styles.heroOverlay, { backgroundColor: 'rgba(0,80,0,0.55)' }]} />
                    <View style={styles.heroContent}>
                        <View style={styles.heroLeafRow}>
                            <Ionicons name="leaf" size={22} color="#fff" />
                        </View>
                        <Text style={styles.heroTagline}>Balance Within</Text>
                    </View>
                </View>

                {/* Our Mission */}
                <View style={styles.missionBlock}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Mission</Text>
                    <Text style={[styles.missionText, { color: theme.textSecondary }]}>
                        To harmonize your mind, body, and spirit through personalized AI-driven wellness journeys that fit seamlessly into your daily life. We believe wellness should be accessible, intuitive, and deeply personal.
                    </Text>
                </View>

                {/* The YogaSathi Story */}
                <View style={[styles.storySection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.storySectionTitle, { color: theme.primary }]}>The YogaSathi Story</Text>
                    {STORY_ITEMS.map((item, i) => (
                        <View key={i} style={[styles.storyCard, { borderColor: theme.divider, borderTopWidth: i > 0 ? 1 : 0 }]}>
                            <View style={[styles.storyIconWrap, { backgroundColor: theme.accent }]}>
                                <Ionicons name={item.icon} size={20} color={theme.primary} />
                            </View>
                            <View style={styles.storyTextWrap}>
                                <Text style={[styles.storyCardTitle, { color: theme.text }]}>{item.title}</Text>
                                <Text style={[styles.storyCardDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Founder Section */}
                <View style={[styles.founderSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.storySectionTitle, { color: theme.primary }]}>Our Founder</Text>
                    <View style={styles.founderRow}>
                        <View style={[styles.founderAvatarWrap, { borderColor: theme.primaryLight }]}>
                            <Image
                                source={require('../assets/images/owner.jpg')}
                                style={styles.founderAvatar}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.founderInfo}>
                            <Text style={[styles.founderName, { color: theme.text }]}>Nakul Bhagwan Dafale</Text>
                            <Text style={[styles.founderRole, { color: theme.primaryLight }]}>Founder & Visionary</Text>
                            <Text style={[styles.founderBio, { color: theme.textSecondary }]}>
                                Passionate about bridging ancient wellness traditions with cutting-edge AI technology to create deeply personal health journeys.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Our Values Grid */}
                <View style={styles.valuesSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Values</Text>
                    <View style={styles.valuesGrid}>
                        {VALUES.map((v, i) => (
                            <View key={i} style={[styles.valueCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={[styles.valueIconWrap, { backgroundColor: v.color + '20' }]}>
                                    <Ionicons name={v.icon} size={24} color={v.color} />
                                </View>
                                <Text style={[styles.valueLabel, { color: theme.text }]}>{v.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Join Our Journey CTA */}
                <View style={[styles.ctaSection, { backgroundColor: theme.primary }]}>
                    <Text style={styles.ctaTitle}>Join Our Journey</Text>
                    <Text style={styles.ctaSubtitle}>
                        Stay updated with our latest AI practices and community stories.
                    </Text>
                    <View style={styles.subscribeRow}>
                        <TextInput
                            style={[styles.subscribeInput, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                            placeholder="Enter your email"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe} activeOpacity={0.85}>
                        <Text style={styles.subscribeBtnText}>Subscribe</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // Top bar
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

    container: { paddingBottom: 0 },

    // Hero
    heroBanner: { width: '100%', height: 180, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    heroContent: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroLeafRow: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 8,
    },
    heroTagline: {
        color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 1,
    },

    // Mission
    missionBlock: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 6 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
    missionText: { fontSize: 14, lineHeight: 22 },

    // Story
    storySection: {
        marginHorizontal: 20, marginTop: 18,
        borderRadius: 16, borderWidth: 1, overflow: 'hidden',
    },
    storySectionTitle: {
        fontSize: 15, fontWeight: '700',
        paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4,
        letterSpacing: 0.3,
    },
    storyCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    storyIconWrap: {
        width: 38, height: 38, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14, flexShrink: 0, marginTop: 2,
    },
    storyTextWrap: { flex: 1 },
    storyCardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
    storyCardDesc: { fontSize: 13, lineHeight: 20 },

    // Founder
    founderSection: {
        marginHorizontal: 20, marginTop: 16,
        borderRadius: 16, borderWidth: 1, padding: 16,
    },
    founderRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
    founderAvatarWrap: {
        width: 80, height: 80, borderRadius: 40,
        borderWidth: 2.5, overflow: 'hidden',
        marginRight: 16, flexShrink: 0,
    },
    founderAvatar: { width: '100%', height: '100%' },
    founderInfo: { flex: 1 },
    founderName: { fontSize: 16, fontWeight: '800', marginBottom: 3 },
    founderRole: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
    founderBio: { fontSize: 13, lineHeight: 19 },

    // Values
    valuesSection: { paddingHorizontal: 20, marginTop: 22 },
    valuesGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', marginTop: 6,
    },
    valueCard: {
        width: '47%', borderRadius: 14, borderWidth: 1,
        padding: 16, alignItems: 'center', marginBottom: 14,
    },
    valueIconWrap: {
        width: 46, height: 46, borderRadius: 23,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 10,
    },
    valueLabel: { fontSize: 14, fontWeight: '700' },

    // CTA
    ctaSection: {
        marginTop: 24, padding: 28,
        alignItems: 'center',
    },
    ctaTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
    ctaSubtitle: {
        fontSize: 13, color: 'rgba(255,255,255,0.8)',
        textAlign: 'center', lineHeight: 19, marginBottom: 20,
    },
    subscribeRow: { width: '100%', marginBottom: 12 },
    subscribeInput: {
        width: '100%', height: 46, borderRadius: 10,
        paddingHorizontal: 16, fontSize: 14, color: '#fff',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    },
    subscribeBtn: {
        width: '100%', height: 46, borderRadius: 23,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
    },
    subscribeBtnText: { fontSize: 15, fontWeight: '700', color: '#2e7d32' },
});
