import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCurrentUser, logoutUser } from '../../services/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

export default function Profile() {
    const { theme } = useTheme();
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const result = await getCurrentUser();
        if (result.success && result.data) {
            const name = result.data.user_metadata?.full_name || result.data.email || 'User';
            setUserName(name);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logoutUser();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    const settingsOptions = [
        { icon: 'settings-outline', label: 'App Settings', route: '/settings' },
        { icon: 'help-circle-outline', label: 'Help & Support' },
    ];

    return (
        <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentContainerStyle={styles.container}>
            {/* Profile Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: theme.accent, borderColor: theme.primaryLight }]}>
                        <Ionicons name="person" size={50} color={theme.textMuted} />
                    </View>
                    <View style={[styles.editBadge, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name="pencil" size={14} color="#fff" />
                    </View>
                </View>
                <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
                <Text style={[styles.userRole, { color: theme.primaryLight }]}>YOGA ENTHUSIAST</Text>
            </View>

            {/* Quick Actions (Dashboard, Reflection, Report) */}
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>MY JOURNEY</Text>
            <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                    style={[styles.quickActionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => router.push('/(tabs)/dashboard')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.quickActionIconWrap, { backgroundColor: '#e0f2fe' }]}>
                        <Ionicons name="bar-chart-outline" size={24} color="#0284c7" />
                    </View>
                    <Text style={[styles.quickActionTitle, { color: theme.text }]}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.quickActionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => router.push('/reflection')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.quickActionIconWrap, { backgroundColor: '#fef3c7' }]}>
                        <Ionicons name="journal-outline" size={24} color="#d97706" />
                    </View>
                    <Text style={[styles.quickActionTitle, { color: theme.text }]}>Reflection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.quickActionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => router.push('/all-reports')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.quickActionIconWrap, { backgroundColor: '#dcfce7' }]}>
                        <Ionicons name="document-text-outline" size={24} color="#16a34a" />
                    </View>
                    <Text style={[styles.quickActionTitle, { color: theme.text }]}>Reports</Text>
                </TouchableOpacity>
            </View>

            {/* Subscription Card */}
            <View style={[styles.subscriptionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.subscriptionContent}>
                    <Text style={[styles.subscriptionLabel, { color: theme.textMuted }]}>SUBSCRIPTION STATUS</Text>
                    <Text style={[styles.subscriptionPlan, { color: theme.text }]}>YogaSathi Premium</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.activeDot, { backgroundColor: theme.primaryLight }]} />
                        <Text style={[styles.activeText, { color: theme.primaryLight }]}>Active</Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.manageButton, { backgroundColor: theme.primaryLight }]}>
                    <Text style={styles.manageButtonText}>Manage</Text>
                </TouchableOpacity>
            </View>

            {/* Account Settings */}
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ACCOUNT SETTINGS</Text>

            <View style={styles.settingsList}>
                {settingsOptions.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={[styles.settingsItem, { borderBottomColor: theme.divider }]}
                        onPress={() => item.route ? router.push(item.route) : null}
                    >
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.settingsIconWrapper, { backgroundColor: theme.accent }]}>
                                <Ionicons name={item.icon} size={22} color={theme.primaryLight} />
                            </View>
                            <Text style={[styles.settingsLabel, { color: theme.text }]}>{item.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={[styles.logoutButton, { borderTopColor: theme.divider }]} onPress={handleLogout}>
                <View style={styles.settingsItemLeft}>
                    <View style={[styles.settingsIconWrapper, styles.logoutIconWrapper]}>
                        <Ionicons name="log-out-outline" size={22} color="#e53e3e" />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        paddingBottom: 40,
        paddingTop: 15,
    },
    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        marginBottom: 25,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 1.5,
    },
    // Quick Actions
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginBottom: 30,
    },
    quickActionCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 14,
        borderWidth: 1,
        marginHorizontal: 4,
    },
    quickActionIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    quickActionTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    // Subscription Card
    subscriptionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        marginBottom: 30,
    },
    subscriptionContent: {
        flex: 1,
    },
    subscriptionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 5,
    },
    subscriptionPlan: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    activeText: {
        fontSize: 13,
        fontWeight: '500',
    },
    manageButton: {
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    manageButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    // Account Settings
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginHorizontal: 20,
        marginBottom: 15,
    },
    settingsList: {
        marginHorizontal: 20,
    },
    settingsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsIconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingsLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    // Logout
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        paddingVertical: 16,
        marginTop: 10,
        borderTopWidth: 1,
    },
    logoutIconWrapper: {
        backgroundColor: '#fed7d7',
    },
    logoutText: {
        fontSize: 16,
        color: '#e53e3e',
        fontWeight: '500',
    },
});
