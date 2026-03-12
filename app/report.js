import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, Title } from 'react-native-paper';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchReports } from '../services/supabaseClient';

export default function Report() {
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLatestReport();
    }, []);

    const loadLatestReport = async () => {
        try {
            setIsLoading(true);
            const result = await fetchReports();

            if (!result.success) {
                throw new Error('Could not load your AI Report.');
            }

            // get the most recent report (index 0 since we ordered by created_at DESC)
            const latestReport = result.data?.length > 0 ? result.data[0] : null;
            setReport(latestReport);
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!report) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>No reports found yet. Complete a daily reflection first!</Text>
                <Button mode="contained" onPress={() => router.replace('/(tabs)/home')}>Back to Home Page</Button>
            </View>
        );
    }

    // Handle parsing JSON depending on if Supabase returns parsed object or stringified JSONB
    const parseJSONField = (field) => {
        if (!field) return [];
        if (typeof field === 'string') {
            try { return JSON.parse(field); } catch (e) { return []; }
        }
        return field;
    };

    const strengths = parseJSONField(report.strengths);
    const weaknesses = parseJSONField(report.weaknesses);
    const suggestions = parseJSONField(report.suggestions);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.scoreCard}>
                <Title style={styles.scoreTitle}>Daily Score</Title>
                <Text style={styles.scoreText}>{report.score} / 100</Text>
            </Card>

            <Text style={styles.summaryText}>{report.summary}</Text>

            <Divider style={styles.divider} />

            <View style={styles.section}>
                <Title style={styles.sectionTitle}>🌟 Strengths</Title>
                {strengths.map((str, idx) => (
                    <Text key={`str-${idx}`} style={styles.listItem}>• {str}</Text>
                ))}
            </View>

            <View style={styles.section}>
                <Title style={styles.sectionTitle}>⚠️ Areas to Improve</Title>
                {weaknesses.map((weak, idx) => (
                    <Text key={`weak-${idx}`} style={styles.listItem}>• {weak}</Text>
                ))}
            </View>

            <View style={styles.section}>
                <Title style={styles.sectionTitle}>💡 Suggestions for Tomorrow</Title>
                {suggestions.map((sug, idx) => (
                    <Text key={`sug-${idx}`} style={styles.listItem}>• {sug}</Text>
                ))}
            </View>

            <Button mode="contained" onPress={() => router.replace('/(tabs)/home')} style={styles.button}>
                Back to Home Page
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#f0f4f8', paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 16, marginBottom: 20, color: '#666', textAlign: 'center' },
    scoreCard: { backgroundColor: '#2e7d32', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20, marginTop: 40 },
    scoreTitle: { color: '#e0e0e0', fontSize: 18 },
    scoreText: { color: '#ffffff', fontSize: 48, fontWeight: 'bold', marginTop: 10 },
    summaryText: { fontSize: 16, color: '#333', lineHeight: 24, fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },
    divider: { marginVertical: 10, backgroundColor: '#ccc' },
    section: { marginVertical: 15, backgroundColor: '#ffffff', padding: 15, borderRadius: 10, elevation: 1 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1a1a1a' },
    listItem: { fontSize: 15, color: '#444', marginBottom: 6, lineHeight: 22 },
    button: { marginTop: 30, paddingVertical: 8, backgroundColor: '#4bb543' }
});
