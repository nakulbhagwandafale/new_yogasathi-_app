import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function PracticeResultScreen() {
    const { poseName, analysisRaw } = useLocalSearchParams();
    const { theme } = useTheme();

    let analysis = null;
    try {
        if (analysisRaw) {
            analysis = JSON.parse(analysisRaw);
        }
    } catch (e) {
        console.error('Failed to parse analysis raw data', e);
    }

    const isCorrect = analysis?.is_correct;

    if (!analysis) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="warning" size={48} color="#ef4444" style={{ marginBottom: 16 }} />
                <Text style={[styles.errorText, { color: theme.text }]}>Could not load analysis results.</Text>
                <TouchableOpacity 
                    style={[styles.primaryBtn, { backgroundColor: theme.primary }]} 
                    onPress={() => router.replace('/(tabs)/practice')}
                >
                    <Text style={styles.primaryBtnText}>Back to Practice</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Custom Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/practice')} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Analysis Result</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Status Card */}
                <View style={[
                    styles.statusCard, 
                    { backgroundColor: isCorrect ? '#ecfdf5' : '#fef2f2', borderColor: isCorrect ? '#10b981' : '#ef4444' }
                ]}>
                    <Ionicons 
                        name={isCorrect ? 'checkmark-circle' : 'alert-circle'} 
                        size={64} 
                        color={isCorrect ? '#10b981' : '#ef4444'} 
                    />
                    <Text style={[styles.poseTitle, { color: theme.text }]}>{poseName}</Text>
                    <Text style={[
                        styles.statusMessage, 
                        { color: isCorrect ? '#047857' : '#b91c1c' }
                    ]}>
                        {analysis.message}
                    </Text>
                </View>

                {/* Correction/Mistakes Section */}
                {!isCorrect && analysis.mistakes && analysis.mistakes.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="eye-off-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>What to Improve</Text>
                        </View>
                        {analysis.mistakes.map((mistake, idx) => (
                            <View key={idx} style={styles.listItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={[styles.listText, { color: theme.textSecondary }]}>{mistake}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Instructions Section */}
                {analysis.instructions && analysis.instructions.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="list-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                {isCorrect ? 'Form Breakdown' : 'How to do it correctly'}
                            </Text>
                        </View>
                        {analysis.instructions.map((inst, idx) => (
                            <View key={idx} style={styles.listItem}>
                                <Text style={[styles.numberBullet, { color: theme.primary }]}>{idx + 1}.</Text>
                                <Text style={[styles.listText, { color: theme.textSecondary }]}>{inst}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 24 }]} 
                    onPress={() => router.replace('/(tabs)/practice')}
                >
                    <Text style={styles.primaryBtnText}>Practice Another Pose</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50, // safe area approx
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    statusCard: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 24,
    },
    poseTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 8,
    },
    statusMessage: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 22,
    },
    section: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bullet: {
        fontSize: 18,
        lineHeight: 22,
        marginRight: 8,
        color: '#ef4444',
    },
    numberBullet: {
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 22,
        marginRight: 8,
        width: 20,
    },
    listText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    primaryBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
