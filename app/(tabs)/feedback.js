import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import { insertFeedback } from '../../services/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

export default function Feedback() {
    const { theme } = useTheme();
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Missing Feedback', 'Please write your feedback before submitting.');
            return;
        }

        setIsLoading(true);

        const feedbackMessage = rating > 0
            ? `[Rating: ${rating}/5] ${message.trim()}`
            : message.trim();

        const result = await insertFeedback(feedbackMessage);

        setIsLoading(false);

        if (result.success) {
            setSubmitted(true);
            setMessage('');
            setRating(0);
        } else {
            Alert.alert('Error', result.error || 'Failed to submit feedback. Please try again.');
        }
    };

    const handleNewFeedback = () => {
        setSubmitted(false);
    };

    if (submitted) {
        return (
            <View style={[styles.successContainer, { backgroundColor: theme.background }]}>
                <View style={styles.successIconWrapper}>
                    <Ionicons name="checkmark-circle" size={80} color={theme.primaryLight} />
                </View>
                <Text style={[styles.successTitle, { color: theme.text }]}>Thank You! 🎉</Text>
                <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                    Your feedback has been submitted successfully. We appreciate your input!
                </Text>
                <TouchableOpacity style={[styles.newFeedbackBtn, { borderColor: theme.primary }]} onPress={handleNewFeedback}>
                    <Text style={[styles.newFeedbackBtnText, { color: theme.primary }]}>Submit Another Feedback</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.headerSection}>
                    <View style={[styles.headerIconWrapper, { backgroundColor: theme.accent }]}>
                        <Ionicons name="chatbubble-ellipses" size={36} color={theme.primary} />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>We Value Your Feedback</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Help us improve YogaSathi AI by sharing your experience and suggestions.
                    </Text>
                </View>

                {/* Star Rating */}
                <View style={[styles.ratingSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.ratingLabel, { color: theme.textSecondary }]}>Rate Your Experience</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                                <Ionicons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={36}
                                    color={star <= rating ? '#f59e0b' : '#d1d5db'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {rating > 0 && (
                        <Text style={[styles.ratingText, { color: theme.primary }]}>
                            {rating === 1 && 'Poor 😞'}
                            {rating === 2 && 'Fair 😐'}
                            {rating === 3 && 'Good 🙂'}
                            {rating === 4 && 'Very Good 😊'}
                            {rating === 5 && 'Excellent 🤩'}
                        </Text>
                    )}
                </View>

                {/* Feedback Input */}
                <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Your Feedback</Text>
                    <View style={[styles.textAreaWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                        <TextInput
                            style={[styles.textArea, { color: theme.inputText }]}
                            placeholder="Tell us what you think... What do you love? What can we improve?"
                            placeholderTextColor={theme.placeholder}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            maxLength={1000}
                        />
                    </View>
                    <Text style={[styles.charCount, { color: theme.textMuted }]}>{message.length}/1000</Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.primary }, (!message.trim()) && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading || !message.trim()}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="send" size={18} color="#fff" style={styles.sendIcon} />
                            <Text style={styles.submitBtnText}>Submit Feedback</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 40,
    },
    // Header
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    headerIconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    // Rating
    ratingSection: {
        alignItems: 'center',
        marginBottom: 30,
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
    },
    ratingLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 15,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    starBtn: {
        padding: 4,
    },
    ratingText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    // Feedback Input
    inputSection: {
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    textAreaWrapper: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 15,
        minHeight: 150,
    },
    textArea: {
        fontSize: 15,
        lineHeight: 22,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        marginTop: 6,
    },
    // Submit
    submitBtn: {
        flexDirection: 'row',
        borderRadius: 28,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    submitBtnDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    sendIcon: {
        marginRight: 8,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Success State
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    successIconWrapper: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    successSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    newFeedbackBtn: {
        borderWidth: 1,
        borderRadius: 28,
        paddingVertical: 14,
        paddingHorizontal: 30,
    },
    newFeedbackBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
