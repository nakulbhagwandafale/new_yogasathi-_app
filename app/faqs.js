import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CHIPS = ['All Topics', 'Account', 'Practices', 'Billing'];

const FAQ_DATA = [
    {
        category: 'Getting Started',
        icon: 'leaf-outline',
        items: [
            {
                id: 'q1',
                question: 'What is YogaSathi?',
                answer: 'YogaSathi is your personal wellness companion, designed to provide guided yoga and mindfulness practices tailored to your lifestyle. We focus on holistic health through movement, breathwork, and meditation.',
            },
            {
                id: 'q2',
                question: 'How do I start my first session?',
                answer: 'Simply navigate to the Home tab and click on the "Start Practice" button for your daily recommended session.',
            },
            {
                id: 'q3',
                question: 'Is this suitable for beginners?',
                answer: 'Absolutely! Our AI assesses your current fitness level and tailors the routines to be perfectly suited for beginners.',
            },
        ],
    },
    {
        category: 'Membership & Billing',
        icon: 'card-outline',
        items: [
            {
                id: 'q4',
                question: 'Can I cancel my subscription anytime?',
                answer: 'Yes, you can cancel your subscription at any time through your Account Settings. Your access will continue until the end of your current billing period.',
            },
            {
                id: 'q5',
                question: 'Do you offer a free trial?',
                answer: 'Yes, we offer a 7-day free trial for all new users to explore the premium features of YogaSathi.',
            },
        ],
    },
];

export default function FAQs() {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChip, setActiveChip] = useState('All Topics');
    const [expandedIds, setExpandedIds] = useState(['q1']); // default expand the first one

    const toggleAccordion = (id) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            {/* Top Bar */}
            <View style={[styles.topBar, { backgroundColor: theme.background }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: theme.text }]}>Support Center</Text>
                <View style={styles.iconBtn}>
                    <Ionicons name="leaf" size={20} color={theme.primaryLight} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={styles.headerBlock}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>How can we help?</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Find answers to common questions about your wellness journey.
                    </Text>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="search-outline" size={20} color={theme.primaryLight} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search topics, keywords..."
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Chips */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.chipsRow}
                >
                    {CHIPS.map(chip => {
                        const isActive = chip === activeChip;
                        return (
                            <TouchableOpacity
                                key={chip}
                                style={[
                                    styles.chip,
                                    { backgroundColor: isActive ? theme.primaryLight : theme.accent }
                                ]}
                                onPress={() => setActiveChip(chip)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    { color: isActive ? '#fff' : theme.textSecondary, fontWeight: isActive ? '600' : '500' }
                                ]}>
                                    {chip}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* FAQ Sections */}
                {FAQ_DATA.map((section, sIndex) => {
                    // Filter based on active chip if needed (just visual for now, showing all if 'All Topics')
                    if (activeChip !== 'All Topics' && !activeChip.includes(section.category.split(' ')[0])) {
                         if (activeChip !== 'Billing' || !section.category.includes('Billing')) {
                             // basic filtering simulation
                             return null; 
                         }
                    }

                    return (
                        <View key={sIndex} style={styles.sectionContainer}>
                            {/* Section Header */}
                            <View style={styles.sectionHeader}>
                                <Ionicons name={section.icon} size={20} color={theme.primaryLight} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.category}</Text>
                            </View>

                            {/* Accordions */}
                            {section.items.map((item) => {
                                const isExpanded = expandedIds.includes(item.id);
                                return (
                                    <View 
                                        key={item.id} 
                                        style={[
                                            styles.accordionCard, 
                                            { backgroundColor: theme.card, borderColor: theme.border },
                                            isExpanded && styles.accordionExpanded
                                        ]}
                                    >
                                        <TouchableOpacity 
                                            style={styles.accordionTouch} 
                                            onPress={() => toggleAccordion(item.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.questionText, { color: theme.text, fontWeight: isExpanded ? '700' : '600' }]}>
                                                {item.question}
                                            </Text>
                                            <Ionicons 
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                                                size={20} 
                                                color={theme.primaryLight} 
                                            />
                                        </TouchableOpacity>
                                        
                                        {isExpanded && (
                                            <View style={styles.answerContainer}>
                                                <Text style={[styles.answerText, { color: theme.textSecondary }]}>
                                                    {item.answer}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}

                {/* Bottom CTA Block */}
                <View style={[styles.ctaBlock, { backgroundColor: theme.accent, borderColor: theme.border }]}>
                    <View style={[styles.ctaIconWrap, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name="headset-outline" size={24} color="#fff" />
                    </View>
                    <Text style={[styles.ctaTitle, { color: theme.text }]}>Still need help?</Text>
                    <Text style={[styles.ctaDesc, { color: theme.textSecondary }]}>
                        Our team of wellness coaches is here to support you 24/7.
                    </Text>

                    <TouchableOpacity 
                        style={[styles.primaryBtn, { backgroundColor: theme.primaryLight }]}
                        onPress={() => router.push('/contact')}
                    >
                        <Ionicons name="mail" size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryBtnText}>Email Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.secondaryBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => router.push('/contact')}
                    >
                        <Ionicons name="chatbubble-ellipses" size={16} color={theme.primaryLight} style={{ marginRight: 8 }} />
                        <Text style={[styles.secondaryBtnText, { color: theme.primaryLight }]}>Live Chat</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    
    // Top bar matching generic style but with background
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    iconBtn: {
        width: 40, height: 40,
        justifyContent: 'center', alignItems: 'center',
    },
    topBarTitle: { fontSize: 16, fontWeight: '700' },

    container: { paddingBottom: 40, paddingHorizontal: 20 },

    // Header
    headerBlock: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    headerTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
    headerSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: 26,
        paddingHorizontal: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 15 },

    // Chips
    chipsRow: {
        flexDirection: 'row',
        marginBottom: 25,
        paddingVertical: 4,
    },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    chipText: { fontSize: 14 },

    // Sections
    sectionContainer: { marginBottom: 25 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        marginLeft: 4,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8 },

    // Accordion
    accordionCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
    },
    accordionExpanded: {
        borderColor: '#e2e8f0', // slightly different border when expanded if needed
    },
    accordionTouch: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    questionText: { fontSize: 14, flex: 1, paddingRight: 10 },
    answerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    answerText: { fontSize: 13, lineHeight: 21 },

    // CTA Bottom
    ctaBlock: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        marginTop: 10,
    },
    ctaIconWrap: {
        width: 48, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
    },
    ctaTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    ctaDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
    
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 48,
        borderRadius: 24,
        marginBottom: 12,
    },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
    },
    secondaryBtnText: { fontSize: 15, fontWeight: '700' },
});
