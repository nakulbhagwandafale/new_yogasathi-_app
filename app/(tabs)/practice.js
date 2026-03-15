import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function PracticeScreen() {
    const { theme } = useTheme();
    const [poseName, setPoseName] = useState('');

    const handleStartPractice = () => {
        if (!poseName.trim()) {
            return;
        }
        router.push({
            pathname: '/practice-camera',
            params: { poseName: poseName.trim() }
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="body" size={64} color={theme.primary} />
                </View>
                
                <Text style={[styles.title, { color: theme.text }]}>
                    AI Yoga Practice
                </Text>
                
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Enter a yoga pose below. We'll use your camera to analyze your posture and provide real-time feedback using Gemini AI.
                </Text>

                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="e.g. Tree Pose, Downward Dog"
                        placeholderTextColor={theme.textMuted}
                        value={poseName}
                        onChangeText={setPoseName}
                        returnKeyType="go"
                        onSubmitEditing={handleStartPractice}
                    />
                </View>

                <TouchableOpacity 
                    style={[
                        styles.startButton, 
                        { backgroundColor: poseName.trim() ? theme.primary : theme.border }
                    ]}
                    onPress={handleStartPractice}
                    disabled={!poseName.trim()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="camera" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.startButtonText}>Start Camera Session</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 24,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 56,
        borderRadius: 28,
    },
    buttonIcon: {
        marginRight: 8,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
