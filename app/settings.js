import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, SegmentedButtons, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { generateFoodPlan, generateYogaPlan } from '../services/geminiService';
import { fetchLatestAssessment, insertDailyPlan, updateAssessment } from '../services/supabaseClient';

export default function Settings() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    
    const [assessmentId, setAssessmentId] = useState(null);
    const [age, setAge] = useState('');
    const [fitnessLevel, setFitnessLevel] = useState('Beginner');
    const [yogaExperience, setYogaExperience] = useState('None');
    const [healthGoal, setHealthGoal] = useState('');
    const [dietPreference, setDietPreference] = useState('Vegetarian');

    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadCurrentAssessment();
    }, []);

    const loadCurrentAssessment = async () => {
        setIsFetching(true);
        try {
            const result = await fetchLatestAssessment();
            if (result.success && result.data) {
                setAssessmentId(result.data.id);
                setAge(result.data.age.toString());
                setFitnessLevel(result.data.fitness_level || 'Beginner');
                setYogaExperience(result.data.yoga_experience || 'None');
                setHealthGoal(result.data.health_goal || '');
                setDietPreference(result.data.diet_preference || 'Vegetarian');
            } else {
                Alert.alert('Error', 'Could not load your assessment data.');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async () => {
        if (!age || !healthGoal) {
            Alert.alert('Missing Info', 'Please fill out your age and health goal.');
            return;
        }

        if (!assessmentId) return;

        setIsSaving(true);

        try {
            // 1. Prepare data
            const updateData = {
                age: parseInt(age, 10),
                fitness_level: fitnessLevel,
                yoga_experience: yogaExperience,
                health_goal: healthGoal,
                diet_preference: dietPreference
            };

            // 2. Update Assessment in Supabase
            const updateResult = await updateAssessment(assessmentId, updateData);
            if (!updateResult.success) {
                throw new Error('Failed to update assessment in the database.');
            }

            // 3. Generate New Plans via Gemini (using the updated data)
            const [yogaResponse, foodResponse] = await Promise.all([
                generateYogaPlan(updateData),
                generateFoodPlan(updateData)
            ]);

            if (!yogaResponse.success || !foodResponse.success) {
                throw new Error('Failed to generate your new AI plans. Please try again.');
            }

            // 4. Save Generated Plans to Supabase
            const dailyPlanData = {
                assessment_id: assessmentId,
                yoga_plan: yogaResponse.data.yoga_plan,
                food_plan: foodResponse.data.food_plan
            };

            const planResponse = await insertDailyPlan(dailyPlanData);
            if (!planResponse.success) {
                throw new Error('Failed to save your new daily plan.');
            }

            // 5. Navigate back to Home
            setIsSaving(false);
            Alert.alert(
                'Assessment Updated!',
                'Your new personalized Yoga and Food plan is ready for you.',
                [{ text: 'Go to Home', onPress: () => router.replace('/(tabs)/home') }]
            );

        } catch (error) {
            setIsSaving(false);
            Alert.alert('Error', error.message);
        }
    };

    if (isFetching || isSaving) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.background }}>
                <LoadingSpinner />
                <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 10 }}>
                    {isSaving ? 'Updating assessment & generating your new plan...' : 'Loading your settings...'}
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + 10 : 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>App Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionHeading, { color: theme.primary }]}>Update Your Assessment</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                        Change these details and we will regenerate a fresh AI-powered daily plan for you.
                    </Text>

                    <TextInput
                        label="Age"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.input, { backgroundColor: theme.background }]}
                        outlineColor={theme.border}
                        activeOutlineColor={theme.primary}
                        textColor={theme.text}
                    />

                    <TextInput
                        label="Primary Health Goal"
                        value={healthGoal}
                        onChangeText={setHealthGoal}
                        placeholder="e.g. Lose weight, reduce stress"
                        mode="outlined"
                        style={[styles.input, { backgroundColor: theme.background }]}
                        outlineColor={theme.border}
                        activeOutlineColor={theme.primary}
                        textColor={theme.text}
                    />

                    <Text style={[styles.label, { color: theme.textSecondary }]}>Fitness Level</Text>
                    <SegmentedButtons
                        value={fitnessLevel}
                        onValueChange={setFitnessLevel}
                        buttons={[
                            { value: 'Beginner', label: 'Beginner' },
                            { value: 'Intermediate', label: 'Mid' },
                            { value: 'Advanced', label: 'Advanced' }
                        ]}
                        style={styles.segmented}
                        theme={{ colors: { secondaryContainer: theme.accent, onSecondaryContainer: theme.primary, onSurface: theme.text } }}
                    />

                    <Text style={[styles.label, { color: theme.textSecondary }]}>Yoga Experience</Text>
                    <SegmentedButtons
                        value={yogaExperience}
                        onValueChange={setYogaExperience}
                        buttons={[
                            { value: 'None', label: 'None' },
                            { value: 'Some', label: 'Some' },
                            { value: 'Expert', label: 'Expert' }
                        ]}
                        style={styles.segmented}
                        theme={{ colors: { secondaryContainer: theme.accent, onSecondaryContainer: theme.primary, onSurface: theme.text } }}
                    />

                    <Text style={[styles.label, { color: theme.textSecondary }]}>Diet Preference</Text>
                    <SegmentedButtons
                        value={dietPreference}
                        onValueChange={setDietPreference}
                        buttons={[
                            { value: 'Vegetarian', label: 'Veg' },
                            { value: 'Vegan', label: 'Vegan' },
                            { value: 'Non-Veg', label: 'Non-Veg' }
                        ]}
                        style={styles.segmented}
                        theme={{ colors: { secondaryContainer: theme.accent, onSecondaryContainer: theme.primary, onSurface: theme.text } }}
                    />

                    <Button 
                        mode="contained" 
                        onPress={handleSave} 
                        style={[styles.button, { backgroundColor: theme.primary }]}
                        labelStyle={styles.buttonText}
                    >
                        Save & Regenerate Plan
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    container: { padding: 20, paddingBottom: 40 },
    card: { 
        padding: 24, 
        borderRadius: 16, 
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    sectionHeading: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
    sectionSubtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
    input: { marginBottom: 15 },
    label: { fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    segmented: { marginBottom: 20 },
    button: { marginTop: 15, borderRadius: 12, paddingVertical: 6 },
    buttonText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});
