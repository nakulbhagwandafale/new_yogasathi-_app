import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const HIGHLIGHTS = [
    {
        icon: 'shield-checkmark-outline',
        iconColor: '#16a34a',
        iconBg: '#dcfce7',
        title: 'Data Encryption',
        desc: 'All your biometric and session data is encrypted using industry-standard protocols. Your private sessions stay private.',
    },
    {
        icon: 'hardware-chip-outline',
        iconColor: '#2563eb',
        iconBg: '#dbeafe',
        title: 'AI Processing',
        desc: 'Our AI models process your movement data locally wherever possible. We never sell your personalized wellness insights to third parties.',
    },
    {
        icon: 'person-circle-outline',
        iconColor: '#16a34a',
        iconBg: '#dcfce7',
        title: 'Your Rights',
        desc: 'You have full control over your data. You can request access, correction, or deletion of your account information at any time.',
    },
];

const PROVISIONS = [
    {
        title: 'Information Collection',
        content: 'We collect information you provide directly to us, such as when you create an account, complete the health assessment, or contact us for support. This includes your name, email address, health goals, fitness level, and yoga experience.',
    },
    {
        title: 'Third-party Partners',
        content: 'We may share your information with third-party vendors and service providers that perform services on our behalf, such as data storage, analytics, and customer service. These partners are bound by strict confidentiality agreements.',
    },
    {
        title: 'Cookie Policy',
        content: 'We use cookies and similar tracking technologies to track activity on our app and store certain information. You can instruct your device to refuse all cookies or indicate when a cookie is being sent.',
    },
];

export default function PrivacyPolicy() {
    const { theme } = useTheme();
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggle = (i) => setExpandedIndex(expandedIndex === i ? null : i);

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            {/* Top Bar */}
            <View style={[styles.topBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: theme.text }]}>Privacy Policy</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Hero Image */}
                <View style={styles.heroWrapper}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Headline */}
                <View style={styles.headlineBlock}>
                    <Text style={[styles.headline, { color: theme.text }]}>Your privacy is our{'\n'}priority</Text>
                    <Text style={[styles.headlineSub, { color: theme.textSecondary }]}>
                        At YogaSathi, we use AI to enhance your wellness journey while ensuring your personal data remains protected and private.
                    </Text>
                </View>

                {/* Highlight Cards */}
                <View style={styles.cardsBlock}>
                    {HIGHLIGHTS.map((item, i) => (
                        <View
                            key={i}
                            style={[styles.highlightCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                        >
                            <View style={[styles.highlightIconWrap, { backgroundColor: item.iconBg }]}>
                                <Ionicons name={item.icon} size={22} color={item.iconColor} />
                            </View>
                            <View style={styles.highlightTextWrap}>
                                <Text style={[styles.highlightTitle, { color: theme.text }]}>{item.title}</Text>
                                <Text style={[styles.highlightDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Manage Data Settings Button */}
                <TouchableOpacity style={[styles.manageBtn, { backgroundColor: theme.accent }]}>
                    <Text style={[styles.manageBtnText, { color: theme.primary }]}>Manage Data Settings</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                {/* Detailed Provisions */}
                <View style={styles.provisionsBlock}>
                    <Text style={[styles.provisionsTitle, { color: theme.text }]}>Detailed Provisions</Text>
                    {PROVISIONS.map((item, i) => (
                        <View key={i}>
                            <TouchableOpacity
                                style={[styles.accordionRow, { borderBottomColor: theme.divider }]}
                                onPress={() => toggle(i)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.accordionTitle, { color: theme.text }]}>{item.title}</Text>
                                <Ionicons
                                    name={expandedIndex === i ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color={theme.textMuted}
                                />
                            </TouchableOpacity>
                            {expandedIndex === i && (
                                <View style={[styles.accordionBody, { backgroundColor: theme.accent }]}>
                                    <Text style={[styles.accordionContent, { color: theme.textSecondary }]}>
                                        {item.content}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Last Updated */}
                <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>
                    Last updated: October 04, 2025
                </Text>

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
    heroWrapper: { width: '100%', height: 190, overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%' },

    // Headline
    headlineBlock: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 10 },
    headline: { fontSize: 22, fontWeight: '800', lineHeight: 30, marginBottom: 10 },
    headlineSub: { fontSize: 14, lineHeight: 21 },

    // Highlight Cards
    cardsBlock: { paddingHorizontal: 20, marginTop: 6 },
    highlightCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 14, borderWidth: 1,
        padding: 16, marginBottom: 12,
    },
    highlightIconWrap: {
        width: 42, height: 42, borderRadius: 21,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14, flexShrink: 0, marginTop: 2,
    },
    highlightTextWrap: { flex: 1 },
    highlightTitle: { fontSize: 15, fontWeight: '700', marginBottom: 5 },
    highlightDesc: { fontSize: 13, lineHeight: 20 },

    // Manage Button
    manageBtn: {
        marginHorizontal: 20, marginTop: 6, marginBottom: 20,
        borderRadius: 10, paddingVertical: 14,
        alignItems: 'center',
    },
    manageBtnText: { fontSize: 14, fontWeight: '700' },

    // Divider
    divider: { height: 1, marginBottom: 20 },

    // Provisions
    provisionsBlock: { paddingHorizontal: 20 },
    provisionsTitle: { fontSize: 17, fontWeight: '800', marginBottom: 14 },
    accordionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    accordionTitle: { fontSize: 15, fontWeight: '500', flex: 1 },
    accordionBody: { borderRadius: 10, padding: 14, marginTop: 4, marginBottom: 8 },
    accordionContent: { fontSize: 13, lineHeight: 20 },

    // Last updated
    lastUpdated: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 24,
        fontStyle: 'italic',
    },
});
