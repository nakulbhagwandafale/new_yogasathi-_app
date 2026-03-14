import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    LayoutAnimation,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Help() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [expandedIds, setExpandedIds] = useState([]);

    const faqs = [
        {
            id: '1',
            q: 'How does the AI generate my daily plan?',
            a: 'YogaSathi uses your initial fitness assessment combined with your daily report feedback to instruct Google Gemini AI. The AI then creates a highly personalized Yoga and Food plan tailored to your body and goals.'
        },
        {
            id: '2',
            q: 'How do I update my fitness assessment?',
            a: 'Go to Profile > App Settings. You can update your age, fitness level, health goals, and diet preferences there. Saving it will instantly generate a fresh plan.'
        },
        {
            id: '3',
            q: 'Can I download or share my daily reports?',
            a: 'Yes! Go to Profile > Reports. Click the blue download icon to save a PDF of your report, or click the green share icon to send it via WhatsApp, email, etc.'
        },
        {
            id: '4',
            q: 'Are the Yoga videos free?',
            a: 'Absolutely. The Yoga video library is fully free and integrates directly with Google Drive links for quick, high-quality streaming without ads.'
        },
        {
            id: '5',
            q: 'How do I change between Light and Dark mode?',
            a: 'The app follows your phone\'s system theme by default, but you can also use the sun/moon toggle button in the top left side drawer menu to switch manually.'
        }
    ];

    const toggleAccordion = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter(item => item !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
        }
    };

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@yogasathi.com?subject=YogaSathi App Support Request');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + 10 : 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Contact Banner */}
                <View style={[styles.contactCard, { backgroundColor: theme.primary }]}>
                    <View style={styles.contactIconWrap}>
                        <MaterialCommunityIcons name="lifebuoy" size={40} color="#fff" />
                    </View>
                    <View style={styles.contactTextWrap}>
                        <Text style={styles.contactTitle}>Need direct help?</Text>
                        <Text style={styles.contactDesc}>We're here for you 24/7. Drop us an email and we'll get back to you soon.</Text>
                        <TouchableOpacity style={styles.emailBtn} onPress={handleEmailSupport}>
                            <Text style={[styles.emailBtnText, { color: theme.primary }]}>Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Links */}
                <View style={[styles.linksGrid]}>
                    <TouchableOpacity style={[styles.linkBox, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/privacy')}>
                        <Ionicons name="shield-checkmark-outline" size={24} color={theme.text} />
                        <Text style={[styles.linkLabel, { color: theme.text }]}>Privacy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.linkBox, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/terms')}>
                        <Ionicons name="document-text-outline" size={24} color={theme.text} />
                        <Text style={[styles.linkLabel, { color: theme.text }]}>Terms</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQs Section */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
                
                <View style={[styles.faqContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {faqs.map((faq, index) => {
                        const isExpanded = expandedIds.includes(faq.id);
                        return (
                            <View key={faq.id}>
                                <TouchableOpacity 
                                    style={styles.faqRow} 
                                    onPress={() => toggleAccordion(faq.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.faqQWrap}>
                                        <Text style={[styles.faqQ, { color: theme.text }]}>{faq.q}</Text>
                                    </View>
                                    <View style={[styles.iconCircle, { backgroundColor: theme.accent }]}>
                                        <Ionicons name={isExpanded ? 'remove' : 'add'} size={20} color={theme.primary} />
                                    </View>
                                </TouchableOpacity>
                                {isExpanded && (
                                    <View style={styles.faqAWrap}>
                                        <Text style={[styles.faqA, { color: theme.textSecondary }]}>{faq.a}</Text>
                                    </View>
                                )}
                                {index < faqs.length - 1 && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
                            </View>
                        );
                    })}
                </View>

                {/* App Version */}
                <Text style={[styles.versionText, { color: theme.textMuted }]}>YogaSathi App v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    container: { padding: 20, paddingBottom: 50 },
    
    // Contact Banner
    contactCard: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    contactIconWrap: { marginRight: 15, justifyContent: 'center' },
    contactTextWrap: { flex: 1 },
    contactTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    contactDesc: { fontSize: 14, color: '#e2fbde', lineHeight: 20, marginBottom: 15 },
    emailBtn: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 24, alignSelf: 'flex-start' },
    emailBtnText: { fontSize: 14, fontWeight: 'bold' },

    // Quick Links
    linksGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 15 },
    linkBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 16, borderWidth: 1 },
    linkLabel: { marginTop: 8, fontSize: 15, fontWeight: '600' },

    // FAQs
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 4 },
    faqContainer: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, overflow: 'hidden' },
    faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
    faqQWrap: { flex: 1, marginRight: 15 },
    faqQ: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    faqAWrap: { paddingBottom: 20, paddingRight: 30 },
    faqA: { fontSize: 14, lineHeight: 24 },
    divider: { height: 1 },

    versionText: { textAlign: 'center', marginTop: 30, fontSize: 13, fontWeight: '500' }
});
