import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, Title } from 'react-native-paper';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateDailyReport, generateNextDayPlan, generateReflectionQuestions } from '../services/geminiService';
import { fetchDailyPlan, fetchLatestAssessment, insertDailyPlan, insertReflection, insertReport } from '../services/supabaseClient';
import { canSubmitReflection } from '../utils/dateUtils';

export default function Reflection() {
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

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isValidTime) {
        return (
            <View style={styles.centerContainer}>
                <Title style={styles.header}>Not Time Yet ⌛</Title>
                <Text style={styles.errorText}>
                    You can only fill out the reflection form after 10:00 PM local time. Check back later tonight!
                </Text>
                <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>No questions generated. Please try again later.</Text>
                <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.header}>Evening Reflection 🌙</Title>

            {questions.map((question, index) => (
                <View key={index} style={styles.questionBlock}>
                    <Text style={styles.questionText}>{index + 1}. {question}</Text>
                    <SegmentedButtons
                        value={answers[index]}
                        onValueChange={(val) => handleAnswerChange(index, val)}
                        buttons={[
                            { value: 'Yes', label: 'Yes' },
                            { value: 'No', label: 'No' },
                        ]}
                        style={styles.segmented}
                    />
                </View>
            ))}

            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                Generate My Report 📈
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, marginBottom: 20, color: '#666', textAlign: 'center', lineHeight: 24 },
    header: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333', marginTop: 40 },
    questionBlock: { marginBottom: 30, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10 },
    questionText: { fontSize: 16, marginBottom: 15, color: '#444', lineHeight: 22 },
    segmented: { marginHorizontal: 10 },
    button: { marginTop: 20, paddingVertical: 8, backgroundColor: '#2e7d32' }
});
