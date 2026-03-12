import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SECTIONS = [
    {
        number: '1.',
        title: 'Acceptance of Terms',
        content: 'By accessing or using YogaSathi, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.',
        alert: null,
        bullets: null,
        link: null,
    },
    {
        number: '2.',
        title: 'AI Wellness Disclaimer',
        content: 'Our AI guide provides wellness suggestions based on general yoga practices. These are not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a healthcare professional before starting any new exercise regimen.',
        alert: 'Important: YogaSathi AI is an assistant, not a certified therapist or doctor.',
        bullets: null,
        link: null,
    },
    {
        number: '3.',
        title: 'User Accounts',
        content: 'To access certain features, you must create an account. You are responsible for:',
        alert: null,
        bullets: [
            'Maintaining the confidentiality of your login credentials.',
            'Providing accurate and up-to-date information.',
            'All activities that occur under your account.',
        ],
        link: null,
    },
    {
        number: '4.',
        title: 'Privacy & Data',
        content: 'Your data is encrypted and handled according to our Privacy Policy. We use your workout data solely to personalize your AI experience and track your progress.',
        alert: null,
        bullets: null,
        link: { label: 'Read Privacy Policy', route: '/privacy' },
    },
];

export default function TermsConditions() {
    const { theme } = useTheme();

    const handleAccept = () => {
        router.back();
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            {/* Top Bar */}
            <View style={[styles.topBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: theme.text }]}>Terms & Conditions</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Doc Icon + Last Updated */}
                <View style={styles.docHeader}>
                    <View style={[styles.docIconWrap, { backgroundColor: theme.accent }]}>
                        <Ionicons name="document-text" size={28} color={theme.primary} />
                    </View>
                    <View>
                        <Text style={[styles.lastUpdatedLabel, { color: theme.textMuted }]}>Last updated</Text>
                        <Text style={[styles.lastUpdatedDate, { color: theme.text }]}>October 24, 2025</Text>
                    </View>
                </View>

                {/* Welcome Text */}
                <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
                    Welcome to YogaSathi. By using our AI-powered wellness services, you agree to the following terms and conditions. We prioritize your privacy and journey to wellness.
                </Text>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                {/* Sections */}
                {SECTIONS.map((sec, i) => (
                    <View key={i} style={styles.section}>
                        {/* Section Heading */}
                        <Text style={[styles.sectionHeading, { color: theme.text }]}>
                            {sec.number} {sec.title}
                        </Text>

                        {/* Main Content */}
                        <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>
                            {sec.content}
                        </Text>

                        {/* Alert Box */}
                        {sec.alert && (
                            <View style={styles.alertBox}>
                                <Ionicons name="warning-outline" size={15} color="#92400e" style={{ marginRight: 6, marginTop: 1 }} />
                                <Text style={styles.alertText}>{sec.alert}</Text>
                            </View>
                        )}

                        {/* Bullet Points */}
                        {sec.bullets && sec.bullets.map((b, j) => (
                            <View key={j} style={styles.bulletRow}>
                                <View style={[styles.bulletDot, { backgroundColor: theme.primary }]} />
                                <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{b}</Text>
                            </View>
                        ))}

                        {/* Link */}
                        {sec.link && (
                            <TouchableOpacity onPress={() => router.push(sec.link.route)} style={styles.linkRow}>
                                <Text style={[styles.linkText, { color: theme.primary }]}>{sec.link.label}</Text>
                                <Ionicons name="arrow-forward" size={14} color={theme.primary} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        )}

                        {/* Section Divider */}
                        {i < SECTIONS.length - 1 && (
                            <View style={[styles.sectionDivider, { backgroundColor: theme.divider }]} />
                        )}
                    </View>
                ))}

                {/* Bottom note */}
                <Text style={[styles.bottomNote, { color: theme.textMuted }]}>
                    By clicking 'Accept', you confirm your agreement to these terms and conditions.
                </Text>

                {/* Spacer for the sticky button */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Sticky Accept Button */}
            <View style={[styles.stickyFooter, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.acceptBtn, { backgroundColor: theme.primary }]}
                    onPress={handleAccept}
                    activeOpacity={0.85}
                >
                    <Text style={styles.acceptBtnText}>I Accept the Terms</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
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

    container: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 10 },

    // Doc Header
    docHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 14,
    },
    docIconWrap: {
        width: 52, height: 52, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
    },
    lastUpdatedLabel: { fontSize: 12, marginBottom: 2 },
    lastUpdatedDate: { fontSize: 15, fontWeight: '700' },

    // Welcome
    welcomeText: { fontSize: 14, lineHeight: 22, marginBottom: 20 },

    // Divider
    divider: { height: 1, marginBottom: 20 },

    // Section
    section: { marginBottom: 4 },
    sectionHeading: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
    sectionContent: { fontSize: 14, lineHeight: 22, marginBottom: 10 },

    // Alert Box
    alertBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fef3c7',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    alertText: { fontSize: 13, color: '#92400e', flex: 1, lineHeight: 19 },

    // Bullets
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingLeft: 4,
    },
    bulletDot: {
        width: 8, height: 8, borderRadius: 4,
        marginTop: 6, marginRight: 10, flexShrink: 0,
    },
    bulletText: { fontSize: 14, lineHeight: 21, flex: 1 },

    // Link
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 10,
    },
    linkText: { fontSize: 14, fontWeight: '600' },

    // Section Divider
    sectionDivider: { height: 1, marginTop: 14, marginBottom: 20 },

    // Bottom Note
    bottomNote: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 10 },

    // Sticky Footer
    stickyFooter: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 1,
    },
    acceptBtn: {
        flexDirection: 'row',
        height: 52, borderRadius: 26,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    acceptBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
