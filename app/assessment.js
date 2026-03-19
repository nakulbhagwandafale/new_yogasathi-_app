import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SegmentedButtons, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { generateFoodPlan, generateYogaPlan } from '../services/geminiService';
import { insertAssessment, insertDailyPlan } from '../services/supabaseClient';

const { width } = Dimensions.get('window');

export default function Assessment() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
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
                height: height.trim(),
                weight: weight.trim(),
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
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <LoadingSpinner />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Generating your personalized AI plan...
                </Text>
                <Text style={[styles.loadingSubtext, { color: theme.textMuted }]}>
                    This may take a moment
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.accent }]}>
                        <Ionicons name="fitness" size={30} color={theme.primary} />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>
                        Personalize Your Plan
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Tell us about yourself so we can create the perfect yoga and nutrition plan just for you.
                    </Text>
                </View>

                {/* Body Metrics Card */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: theme.accent }]}>
                            <Ionicons name="body-outline" size={16} color={theme.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Body Metrics</Text>
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.inputHalf}>
                            <TextInput
                                label="Age"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                                mode="outlined"
                                left={<TextInput.Icon icon="calendar-account" />}
                                style={[styles.input, { backgroundColor: theme.background }]}
                                outlineColor={theme.border}
                                activeOutlineColor={theme.primary}
                                textColor={theme.text}
                                outlineStyle={styles.inputOutline}
                            />
                        </View>
                        <View style={styles.inputHalf}>
                            <TextInput
                                label="Height"
                                value={height}
                                onChangeText={setHeight}
                                placeholder="e.g. 175cm"
                                mode="outlined"
                                left={<TextInput.Icon icon="human-male-height" />}
                                style={[styles.input, { backgroundColor: theme.background }]}
                                outlineColor={theme.border}
                                activeOutlineColor={theme.primary}
                                textColor={theme.text}
                                outlineStyle={styles.inputOutline}
                            />
                        </View>
                    </View>

                    <TextInput
                        label="Weight"
                        value={weight}
                        onChangeText={setWeight}
                        placeholder="e.g. 70 kg"
                        mode="outlined"
                        left={<TextInput.Icon icon="weight" />}
                        style={[styles.input, { backgroundColor: theme.background }]}
                        outlineColor={theme.border}
                        activeOutlineColor={theme.primary}
                        textColor={theme.text}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                {/* Health Goal Card */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: theme.accent }]}>
                            <Ionicons name="flag-outline" size={16} color={theme.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Goal</Text>
                    </View>

                    <TextInput
                        label="Primary Health Goal"
                        value={healthGoal}
                        onChangeText={setHealthGoal}
                        placeholder="e.g. Lose weight, reduce stress"
                        mode="outlined"
                        left={<TextInput.Icon icon="target" />}
                        style={[styles.input, { backgroundColor: theme.background }]}
                        outlineColor={theme.border}
                        activeOutlineColor={theme.primary}
                        textColor={theme.text}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                {/* Fitness & Experience Card */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: theme.accent }]}>
                            <Ionicons name="barbell-outline" size={16} color={theme.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Fitness Profile</Text>
                    </View>

                    <Text style={[styles.segmentLabel, { color: theme.textSecondary }]}>Fitness Level</Text>
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

                    <Text style={[styles.segmentLabel, { color: theme.textSecondary }]}>Yoga Experience</Text>
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
                </View>

                {/* Diet Preference Card */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBadge, { backgroundColor: theme.accent }]}>
                            <Ionicons name="nutrition-outline" size={16} color={theme.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Diet Preference</Text>
                    </View>

                    <SegmentedButtons
                        value={dietPreference}
                        onValueChange={setDietPreference}
                        buttons={[
                            { value: 'Vegetarian', label: '🥗 Veg' },
                            { value: 'Vegan', label: '🌱 Vegan' },
                            { value: 'Non-Veg', label: '🍗 Non-Veg' }
                        ]}
                        style={styles.segmented}
                        theme={{ colors: { secondaryContainer: theme.accent, onSecondaryContainer: theme.primary, onSurface: theme.text } }}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                    style={styles.submitBtnWrapper}
                >
                    <LinearGradient
                        colors={[theme.primary, theme.primaryLight || '#4bb543']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitBtn}
                    >
                        <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.submitBtnText}>Generate My AI Plan</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Footer note */}
                <View style={styles.footerNote}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={theme.textMuted} />
                    <Text style={[styles.footerText, { color: theme.textMuted }]}>
                        Your data is encrypted and never shared with third parties.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    loadingText: { fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' },
    loadingSubtext: { fontSize: 13, marginTop: 6 },

    // Header
    headerSection: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
    iconCircle: {
        width: 60, height: 60, borderRadius: 30,
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
    subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 8, paddingHorizontal: 16 },

    // Cards
    card: {
        borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 16,
        elevation: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionIconBadge: {
        width: 32, height: 32, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700' },

    // Inputs
    inputRow: { flexDirection: 'row', gap: 12 },
    inputHalf: { flex: 1 },
    input: { marginBottom: 12 },
    inputOutline: { borderRadius: 12 },

    // Segments
    segmentLabel: {
        fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
        letterSpacing: 0.5, marginBottom: 8, marginTop: 4,
    },
    segmented: { marginBottom: 14 },

    // Submit
    submitBtnWrapper: { marginTop: 8, marginBottom: 10 },
    submitBtn: {
        height: 54, borderRadius: 16, flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2e7d32', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

    // Footer
    footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6, gap: 6 },
    footerText: { fontSize: 12 },
});
