import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Button, Text, Title } from 'react-native-paper';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchReports } from '../../services/supabaseClient';

const screenWidth = Dimensions.get('window').width;

export default function DashboardTab() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalyticsData();
    }, []);

    const loadAnalyticsData = async () => {
        try {
            setIsLoading(true);
            const result = await fetchReports();
            if (!result.success) {
                throw new Error('Failed to load history.');
            }

            // Supabase returns newest first (DESC). We want oldest to newest for charts:
            const sortedData = (result.data || []).reverse();
            setReports(sortedData);
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (reports.length < 2) {
        return (
            <View style={styles.centerContainer}>
                <Title style={styles.header}>Not Enough Data 📈</Title>
                <Text style={styles.errorText}>
                    You need at least 2 daily reports to start seeing your progress trends. Check back tomorrow!
                </Text>
                <Button mode="contained" onPress={() => router.replace('/(tabs)/home')}>Back to Home Page</Button>
            </View>
        );
    }

    // Formatting Data for react-native-chart-kit
    const labels = reports.map((r, idx) => `Day ${idx + 1}`);
    const scores = reports.map(r => r.score || 0);

    const lineChartData = {
        labels: labels.slice(-7), // Show last 7 days max for clean UI
        datasets: [{ data: scores.slice(-7) }]
    };

    // We can calculate improvement by plotting the change in score vs previous day
    const improvementScores = [];
    for (let i = 1; i < scores.length; i++) {
        improvementScores.push(scores[i] - scores[i - 1]);
    }
    const barChartLabels = labels.slice(-improvementScores.length).slice(-5); // Last 5 changes
    const barChartDataVal = improvementScores.slice(-5);

    const barChartData = {
        labels: barChartLabels.length > 0 ? barChartLabels : ['No changes'],
        datasets: [{ data: barChartDataVal.length > 0 ? barChartDataVal : [0] }]
    };

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 3,
        barPercentage: 0.6,
        useShadowColorFromDataset: false,
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#388e3c'
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.mainTitle}>Your Analytics 📊</Title>

            <View style={styles.chartContainer}>
                <Title style={styles.chartTitle}>Daily Progress</Title>
                <Text style={styles.chartSubtitle}>Your AI generated scores over time</Text>
                <LineChart
                    data={lineChartData}
                    width={screenWidth - 40} // padding 20 on each side
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                />
            </View>

            <View style={styles.chartContainer}>
                <Title style={styles.chartTitle}>Improvement Trend</Title>
                <Text style={styles.chartSubtitle}>Score difference vs previous day</Text>
                <BarChart
                    data={barChartData}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel={improvementScores.some(s => s < 0) ? "" : "+"}
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(75, 181, 67, ${opacity})`, // Green color for bars
                    }}
                    style={styles.chartStyle}
                    showValuesOnTopOfBars={true}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#fafafa', paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fafafa' },
    errorText: { fontSize: 16, marginBottom: 20, color: '#666', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
    mainTitle: { fontSize: 28, fontWeight: 'bold', marginVertical: 30, textAlign: 'center', color: '#2e7d32' },
    chartContainer: { marginBottom: 30, backgroundColor: '#fff', borderRadius: 15, padding: 10, elevation: 2 },
    chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10 },
    chartSubtitle: { fontSize: 13, color: '#888', marginLeft: 10, marginBottom: 10 },
    chartStyle: { marginVertical: 8, borderRadius: 16, overflow: 'hidden' },
});
