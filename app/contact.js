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
import { insertContactMessage } from '../services/supabaseClient';

const CATEGORIES = ['General Inquiry', 'Technical Support', 'Billing', 'Feedback', 'Other'];

export default function ContactUs() {
    const { theme } = useTheme();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('General Inquiry');
    const [message, setMessage] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!fullName.trim() || !email.trim() || !message.trim()) {
            Alert.alert('Missing Info', 'Please fill in all fields before sending.');
            return;
        }
        setIsSending(true);
        try {
            const result = await insertContactMessage({
                full_name: fullName.trim(),
                email: email.trim(),
                category,
                message: message.trim(),
            });

            if (!result.success) {
                Alert.alert('Error', result.error || 'Failed to send message. Please try again.');
                return;
            }

            // Clear form fields
            setFullName('');
            setEmail('');
            setCategory('General Inquiry');
            setMessage('');

            Alert.alert('Message Sent \u2705', "We'll get back to you within 24 hours!", [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Custom Header */}
            <View style={[styles.topBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: theme.text }]}>Contact Us</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Hero Image */}
                <View style={styles.heroWrapper}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroOverlay} />
                </View>

                {/* Hero Text */}
                <View style={styles.heroTextBlock}>
                    <Text style={[styles.heroTitle, { color: theme.text }]}>We're here to help</Text>
                    <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                        Have questions about your wellness journey?{'\n'}Reach out to the YogaSathi team.
                    </Text>
                </View>

                {/* Email Support Card */}
                <View style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.contactIconCircle, { backgroundColor: theme.accent }]}>
                        <Ionicons name="mail" size={22} color={theme.primary} />
                    </View>
                    <Text style={[styles.contactCardTitle, { color: theme.text }]}>Email Support</Text>
                    <Text style={[styles.contactCardSub, { color: theme.textMuted }]}>Response within 24 hours</Text>
                    <Text style={[styles.contactCardLink, { color: theme.primaryLight }]}>support@yogasathi.com</Text>
                </View>

                {/* Live Chat Card */}
                <View style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.contactIconCircle, { backgroundColor: theme.accent }]}>
                        <Ionicons name="chatbubble-ellipses" size={22} color={theme.primary} />
                    </View>
                    <Text style={[styles.contactCardTitle, { color: theme.text }]}>Live Chat</Text>
                    <Text style={[styles.contactCardSub, { color: theme.textMuted }]}>Available 9 AM – 9 PM</Text>
                    <Text style={[styles.contactCardLink, { color: theme.primaryLight }]}>Start a conversation</Text>
                </View>

                {/* Message Form */}
                <View style={[styles.formSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.formTitle, { color: theme.text }]}>Send us a message</Text>

                    {/* Full Name */}
                    <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: theme.inputText }]}
                            placeholder="Full Name"
                            placeholderTextColor={theme.placeholder}
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email */}
                    <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: theme.inputText }]}
                            placeholder="Email Address"
                            placeholderTextColor={theme.placeholder}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Category Dropdown */}
                    <Text style={[styles.dropdownLabel, { color: theme.textSecondary }]}>How can we help?</Text>
                    <TouchableOpacity
                        style={[styles.inputWrapper, styles.dropdownRow, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                        onPress={() => setDropdownOpen(!dropdownOpen)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.input, { color: theme.inputText, flex: 1 }]}>{category}</Text>
                        <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                    {dropdownOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.dropdownItem,
                                        { borderBottomColor: theme.divider },
                                        cat === category && { backgroundColor: theme.accent },
                                    ]}
                                    onPress={() => { setCategory(cat); setDropdownOpen(false); }}
                                >
                                    <Text style={[styles.dropdownItemText, { color: cat === category ? theme.primary : theme.text }]}>
                                        {cat}
                                    </Text>
                                    {cat === category && (
                                        <Ionicons name="checkmark" size={16} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Message */}
                    <Text style={[styles.dropdownLabel, { color: theme.textSecondary }]}>Message</Text>
                    <View style={[styles.inputWrapper, styles.textAreaWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                        <TextInput
                            style={[styles.input, styles.textArea, { color: theme.inputText }]}
                            placeholder="Tell us more about your request..."
                            placeholderTextColor={theme.placeholder}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Send Button */}
                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: theme.primary }, isSending && { opacity: 0.7 }]}
                        onPress={handleSend}
                        disabled={isSending}
                        activeOpacity={0.85}
                    >
                        {isSending
                            ? <Text style={styles.sendBtnText}>Sending...</Text>
                            : (
                                <>
                                    <Ionicons name="send" size={16} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.sendBtnText}>Send Message</Text>
                                </>
                            )
                        }
                    </TouchableOpacity>
                </View>

                {/* Follow Section */}
                <View style={styles.socialSection}>
                    <Text style={[styles.socialTitle, { color: theme.textMuted }]}>Follow our journey</Text>
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: theme.accent }]}>
                            <Ionicons name="logo-instagram" size={22} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: theme.accent }]}>
                            <Ionicons name="share-social-outline" size={22} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialBtn, { backgroundColor: theme.accent }]}>
                            <Ionicons name="logo-youtube" size={22} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
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
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBarTitle: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Scroll content
    container: { paddingBottom: 40 },

    // Hero
    heroWrapper: { width: '100%', height: 180, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.12)',
    },
    heroTextBlock: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 22,
        paddingBottom: 10,
    },
    heroTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
    heroSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    // Contact cards
    contactCard: {
        marginHorizontal: 20,
        marginTop: 14,
        borderRadius: 14,
        borderWidth: 1,
        padding: 18,
        alignItems: 'center',
    },
    contactIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    contactCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    contactCardSub: { fontSize: 13, marginBottom: 6 },
    contactCardLink: { fontSize: 14, fontWeight: '600' },

    // Form
    formSection: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        borderWidth: 1,
        padding: 18,
    },
    formTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
    dropdownLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
    inputWrapper: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 48,
        justifyContent: 'center',
        marginBottom: 10,
    },
    dropdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
    },
    input: { fontSize: 14 },
    textAreaWrapper: { height: 110, alignItems: 'flex-start', paddingVertical: 12 },
    textArea: { width: '100%' },

    // Dropdown list
    dropdownList: {
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    dropdownItemText: { fontSize: 14, fontWeight: '500' },

    // Send button
    sendBtn: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 6,
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
    },
    sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Social
    socialSection: { alignItems: 'center', marginTop: 28 },
    socialTitle: { fontSize: 13, marginBottom: 12, fontWeight: '500' },
    socialRow: { flexDirection: 'row', gap: 14 },
    socialBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
