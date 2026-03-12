import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput, Title } from 'react-native-paper';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateFoodPlan, generateYogaPlan } from '../services/geminiService';
import { insertAssessment, insertDailyPlan } from '../services/supabaseClient';

export default function Assessment() {
    const [age, setAge] = useState('');
    const [fitnessLevel, setFitnessLevel] = useState('Beginner');
    const [yogaExperience, setYogaExperience] = useState('None');
    const [healthGoal, setHealthGoal] = useState('');
    const [dietPreference, setDietPreference] = useState('Vegetarian');

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!age || !healthGoal) {
            Alert.alert('Missing Info', 'Please fill out your age and health goal.');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Prepare data
            const assessmentData = {
                age: parseInt(age, 10),
                fitness_level: fitnessLevel,
                yoga_experience: yogaExperience,
                health_goal: healthGoal,
                diet_preference: dietPreference
            };

            // 2. Save Assessment to Supabase
            const assessmentResponse = await insertAssessment(assessmentData);
            if (!assessmentResponse.success) {
                throw new Error('Failed to save assessment to database.');
            }
            const assessmentId = assessmentResponse.data.id;

            // 3. Generate Plans via Gemini
            const [yogaResponse, foodResponse] = await Promise.all([
                generateYogaPlan(assessmentData),
                generateFoodPlan(assessmentData)
            ]);

            if (!yogaResponse.success || !foodResponse.success) {
                throw new Error('Failed to generate AI plans. Please try again.');
            }

            // 4. Save Generated Plans to Supabase
            const dailyPlanData = {
                assessment_id: assessmentId,
                yoga_plan: yogaResponse.data.yoga_plan,
                food_plan: foodResponse.data.food_plan
            };

            const planResponse = await insertDailyPlan(dailyPlanData);
            if (!planResponse.success) {
                throw new Error('Failed to save your daily plan.');
            }

            // 5. Navigate to Dashboard
            setIsLoading(false);
            router.replace('/(tabs)/home');

        } catch (error) {
            setIsLoading(false);
            Alert.alert('Error', error.message);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.header}>Personalize Your Plan</Title>

            <TextInput
                label="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
            />

            <TextInput
                label="Primary Health Goal"
                value={healthGoal}
                onChangeText={setHealthGoal}
                placeholder="e.g. Lose weight, reduce stress"
                mode="outlined"
                style={styles.input}
            />

            <Text style={styles.label}>Fitness Level</Text>
            <SegmentedButtons
                value={fitnessLevel}
                onValueChange={setFitnessLevel}
                buttons={[
                    { value: 'Beginner', label: 'Beginner' },
                    { value: 'Intermediate', label: 'Mid' },
                    { value: 'Advanced', label: 'Advanced' }
                ]}
                style={styles.segmented}
            />

            <Text style={styles.label}>Yoga Experience</Text>
            <SegmentedButtons
                value={yogaExperience}
                onValueChange={setYogaExperience}
                buttons={[
                    { value: 'None', label: 'None' },
                    { value: 'Some', label: 'Some' },
                    { value: 'Expert', label: 'Expert' }
                ]}
                style={styles.segmented}
            />

            <Text style={styles.label}>Diet Preference</Text>
            <SegmentedButtons
                value={dietPreference}
                onValueChange={setDietPreference}
                buttons={[
                    { value: 'Vegetarian', label: 'Veg' },
                    { value: 'Vegan', label: 'Vegan' },
                    { value: 'Non-Veg', label: 'Non-Veg' }
                ]}
                style={styles.segmented}
            />

            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                Generate My AI Plan
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', paddingBottom: 40 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', marginTop: 40 },
    input: { marginBottom: 15 },
    label: { fontSize: 16, marginTop: 10, marginBottom: 5, color: '#444' },
    segmented: { marginBottom: 15 },
    button: { marginTop: 30, paddingVertical: 5 }
});
