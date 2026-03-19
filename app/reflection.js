import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { generateDailyReport, generateNextDayPlan, generateReflectionQuestions } from '../services/geminiService';
import { fetchDailyPlan, fetchLatestAssessment, insertDailyPlan, insertReflection, insertReport, fetchSubscription } from '../services/supabaseClient';
import { canSubmitReflection } from '../utils/dateUtils';
import { isTrialExpired } from '../utils/subscriptionUtils';

export default function Reflection() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [activePlanId, setActivePlanId] = useState(null);
    const [activeYogaPlan, setActiveYogaPlan] = useState(null);
    const [activeFoodPlan, setActiveFoodPlan] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isValidTime, setIsValidTime] = useState(true);

    useEffect(() => {
        loadReflectionForm();
    }, []);

    const loadReflectionForm = async () => {
        try {
            setIsLoading(true);

            // Check subscription
            const subResult = await fetchSubscription();
            if (subResult.success && isTrialExpired(subResult.data)) {
                setIsValidTime(false); // we reuse this state to block the UI
                Alert.alert(
                    'Trial Expired',
                    'Your free trial has ended. Please choose a paid plan to submit reflections and generate new plans.',
                    [{ text: 'View Plans', onPress: () => router.replace('/pricing') }]
                );
                return;
            }

            // Fetch today's plan
            const planResult = await fetchDailyPlan();
            if (!planResult.success || !planResult.data) {
                throw new Error('No active daily plan found to reflect upon.');
            }

            // Check time constraint using the plan's creation date
            if (!canSubmitReflection(planResult.data.created_at)) {
                setIsValidTime(false);
                setIsLoading(false);
                return;
            }

            setActivePlanId(planResult.data.id);

            const yogaPlan = typeof planResult.data.yoga_plan === 'string'
                ? JSON.parse(planResult.data.yoga_plan)
                : planResult.data.yoga_plan;

            const foodPlan = typeof planResult.data.food_plan === 'string'
                ? JSON.parse(planResult.data.food_plan)
                : planResult.data.food_plan;

            setActiveYogaPlan(yogaPlan);
            setActiveFoodPlan(foodPlan);

            // Ask Gemini for Dynamic Questions
            const aiResult = await generateReflectionQuestions(yogaPlan, foodPlan);
            if (!aiResult.success) {
                throw new Error('Failed to generate reflection questions.');
            }

            setQuestions(aiResult.data.questions || []);

            // Initialize default answers to 'Yes'
            const initAnswers = {};
            (aiResult.data.questions || []).forEach((q, idx) => {
                initAnswers[idx] = 'Yes';
            });
            setAnswers(initAnswers);

        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (index, value) => {
        setAnswers({ ...answers, [index]: value });
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            // Format answers into array: [{ question: "...", answer: "Yes" }]
            const formattedAnswers = questions.map((q, idx) => ({
                question: q,
                answer: answers[idx]
            }));

            const reflectionData = {
                plan_id: activePlanId,
                answers: formattedAnswers
            };

            const reflectionResult = await insertReflection(reflectionData);

            if (!reflectionResult.success) {
                throw new Error('Could not save your reflection.');
            }

            const reflectionId = reflectionResult.data.id;

            // Generate AI Report
            const aiReportResult = await generateDailyReport(formattedAnswers, activeYogaPlan, activeFoodPlan);
            if (!aiReportResult.success) {
                throw new Error('Failed to generate daily report.');
            }

            const generatedReport = aiReportResult.data.report;

            const reportData = {
                reflection_id: reflectionId,
                score: generatedReport.score,
                summary: generatedReport.summary,
                strengths: generatedReport.strengths,
                weaknesses: generatedReport.weaknesses,
                suggestions: generatedReport.suggestions
            };

            const reportSaveResult = await insertReport(reportData);
            if (!reportSaveResult.success) {
                throw new Error('Could not save your daily report.');
            }

            // --- Auto-generate next day's plan ---
            const assessmentResult = await fetchLatestAssessment();
            if (assessmentResult.success && assessmentResult.data) {
                const nextDayResult = await generateNextDayPlan(
                    assessmentResult.data,
                    activeYogaPlan,
                    activeFoodPlan,
                    generatedReport
                );

                if (nextDayResult.success && nextDayResult.data) {
                    await insertDailyPlan({
                        yoga_plan: nextDayResult.data.yoga_plan,
                        food_plan: nextDayResult.data.food_plan
                    });
                }
            }
            // --------------------------------------

            // Route to Report UI
            setIsLoading(false);
            router.replace('/report');

        } catch (error) {
            setIsLoading(false);
            Alert.alert('Submit Error', error.message);
        }
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <View style={[styles.centeredScreen, { backgroundColor: theme.background }]}>
                <LoadingSpinner />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Preparing your reflection...
                </Text>
            </View>
        );
    }

    // --- Not Valid Time State ---
    if (!isValidTime) {
        return (
            <View style={[styles.centeredScreen, { backgroundColor: theme.background }]}>
                <View style={[styles.stateCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.stateIconCircle, { backgroundColor: theme.accent }]}>  
                        <Ionicons name="time-outline" size={36} color={theme.primary} />
                    </View>
                    <Text style={[styles.stateTitle, { color: theme.text }]}>Not Time Yet</Text>
                    <Text style={[styles.stateDesc, { color: theme.textSecondary }]}>
                        You can only fill out the reflection form after 10:00 PM local time. Check back later tonight!
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.stateBtn, { backgroundColor: theme.primary }]}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="arrow-back" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.stateBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // --- No Questions State ---
    if (questions.length === 0) {
        return (
            <View style={[styles.centeredScreen, { backgroundColor: theme.background }]}>
                <View style={[styles.stateCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.stateIconCircle, { backgroundColor: '#FFF3E0' }]}>  
                        <Ionicons name="alert-circle-outline" size={36} color="#EF6C00" />
                    </View>
                    <Text style={[styles.stateTitle, { color: theme.text }]}>No Questions</Text>
                    <Text style={[styles.stateDesc, { color: theme.textSecondary }]}>
                        No reflection questions were generated. Please try again later.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.stateBtn, { backgroundColor: theme.primary }]}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="arrow-back" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.stateBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // --- Main Reflection Form ---
    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Evening Reflection</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={[styles.heroIconCircle, { backgroundColor: theme.accent }]}>
                        <Ionicons name="moon" size={28} color={theme.primary} />
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.text }]}>
                        How was your day?
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                        Answer these questions honestly so the AI can generate an accurate report and plan for tomorrow.
                    </Text>
                </View>

                {/* Progress Indicator */}
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                    <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${(Object.keys(answers).length / Math.max(questions.length, 1)) * 100}%` }]} />
                </View>
                <Text style={[styles.progressLabel, { color: theme.textMuted }]}>
                    {questions.length} question{questions.length !== 1 ? 's' : ''} to reflect on
                </Text>

                {/* Question Cards */}
                {questions.map((question, index) => (
                    <View
                        key={index}
                        style={[styles.questionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                        <View style={styles.questionHeader}>
                            <View style={[styles.questionBadge, { backgroundColor: theme.accent }]}>
                                <Text style={[styles.questionBadgeText, { color: theme.primary }]}>
                                    Q{index + 1}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.questionText, { color: theme.text }]}>
                            {question}
                        </Text>
                        <View style={styles.segmentedWrapper}>
                            <SegmentedButtons
                                value={answers[index]}
                                onValueChange={(val) => handleAnswerChange(index, val)}
                                buttons={[
                                    { value: 'Yes', label: '✅ Yes', style: answers[index] === 'Yes' ? {} : {} },
                                    { value: 'No', label: '❌ No' },
                                ]}
                                style={styles.segmented}
                                theme={{ colors: { secondaryContainer: theme.accent, onSecondaryContainer: theme.primary, onSurface: theme.text } }}
                            />
                        </View>
                    </View>
                ))}

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                    style={styles.submitWrapper}
                >
                    <LinearGradient
                        colors={[theme.primary, theme.primaryLight || '#4bb543']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitBtn}
                    >
                        <Ionicons name="analytics" size={20} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.submitBtnText}>Generate My Report</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Footer Note */}
                <View style={styles.footerNote}>
                    <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
                    <Text style={[styles.footerText, { color: theme.textMuted }]}>
                        Your AI report and tomorrow's plan will be generated automatically.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    // Centered states (loading / not-valid / no questions)
    centeredScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    loadingText: { fontSize: 15, fontWeight: '500', marginTop: 14, textAlign: 'center' },
    stateCard: {
        width: '100%', maxWidth: 360, borderRadius: 20, borderWidth: 1,
        padding: 30, alignItems: 'center',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
    },
    stateIconCircle: {
        width: 72, height: 72, borderRadius: 36,
        justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    },
    stateTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
    stateDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
    stateBtn: {
        flexDirection: 'row', height: 46, paddingHorizontal: 24, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
    },
    stateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
    },
    backBtn: {
        width: 34, height: 34, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.2 },

    // Hero
    heroSection: { alignItems: 'center', marginTop: 24, marginBottom: 20 },
    heroIconCircle: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    heroTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
    heroSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 8, paddingHorizontal: 10 },

    // Progress
    progressBar: { height: 4, borderRadius: 2, marginBottom: 6, marginTop: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    progressLabel: { fontSize: 12, textAlign: 'center', marginBottom: 18 },

    // Question cards
    questionCard: {
        borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 14,
        elevation: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
    },
    questionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    questionBadge: {
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8,
    },
    questionBadgeText: { fontSize: 12, fontWeight: '800' },
    questionText: { fontSize: 15, lineHeight: 22, fontWeight: '500', marginBottom: 14 },
    segmentedWrapper: { marginHorizontal: 0 },
    segmented: {},

    // Submit
    submitWrapper: { marginTop: 10, marginBottom: 10 },
    submitBtn: {
        height: 54, borderRadius: 16, flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2e7d32', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

    // Footer
    footerNote: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: 6, gap: 6, paddingHorizontal: 10,
    },
    footerText: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
});
