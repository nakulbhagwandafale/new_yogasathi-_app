import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Divider, Title } from 'react-native-paper';
import FoodCard from '../../components/FoodCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import YogaCard from '../../components/YogaCard';
import { fetchDailyPlan } from '../../services/supabaseClient';

export default function HomePage() {
    const [dailyPlan, setDailyPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadHomeData();
    }, []);

    const loadHomeData = async () => {
        setIsLoading(true);
        const result = await fetchDailyPlan();

        if (!result.success) {
            Alert.alert('Error', 'Could not load your daily plan. Try again later.');
        } else {
            setDailyPlan(result.data);
        }

        setIsLoading(false);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!dailyPlan) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>No active plan found.</Text>
                <Button mode="contained" onPress={() => router.replace('/assessment')}>Take Assessment</Button>
            </View>
        );
    }

    // Handle parsing stringified JSON vs raw JSONB correctly based on Supabase return type
    const yogaPlan = typeof dailyPlan.yoga_plan === 'string' ? JSON.parse(dailyPlan.yoga_plan) : dailyPlan.yoga_plan;
    const foodPlan = typeof dailyPlan.food_plan === 'string' ? JSON.parse(dailyPlan.food_plan) : dailyPlan.food_plan;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Title style={styles.headerTitle}>☀️ Today&apos;s Plan</Title>
            </View>

            <View style={styles.section}>
                <Title style={styles.sectionTitle}>🧘‍♀️ Your Yoga Routine</Title>
                {yogaPlan && yogaPlan.map((yogaItem, index) => (
                    <YogaCard key={`yoga-${index}`} plan={yogaItem} />
                ))}
            </View>

            <Divider style={styles.mainDivider} />

            <View style={styles.section}>
                <Title style={styles.sectionTitle}>🥗 Nutrition Guide</Title>
                {foodPlan && foodPlan.map((foodItem, index) => (
                    <FoodCard key={`food-${index}`} plan={foodItem} />
                ))}
            </View>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={() => router.push('/reflection')}
                    style={styles.reflectionBtn}
                    labelStyle={styles.btnLabel}
                >
                    📝 Fill Reflection Form
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#fafafa', paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 18, marginBottom: 20, color: '#666' },
    header: { backgroundColor: '#2e7d32', padding: 25, paddingTop: 60, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    mainDivider: { height: 2, backgroundColor: '#eee', marginHorizontal: 20 },
    footer: { padding: 20, marginTop: 10 },
    reflectionBtn: { paddingVertical: 8, backgroundColor: '#4bb543' },
    btnLabel: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});
