import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCurrentUser, logoutUser } from '../../services/supabaseClient';

export default function Profile() {
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
        { icon: 'person-outline', label: 'Personal Info' },
        { icon: 'heart-outline', label: 'My Wellness Goals' },
        { icon: 'notifications-outline', label: 'Notifications' },
        { icon: 'settings-outline', label: 'App Settings' },
        { icon: 'help-circle-outline', label: 'Help & Support' },
    ];

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Profile Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={50} color="#a0aec0" />
                    </View>
                    <View style={styles.editBadge}>
                        <Ionicons name="pencil" size={14} color="#fff" />
                    </View>
                </View>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userRole}>YOGA ENTHUSIAST</Text>
            </View>

            {/* Subscription Card */}
            <View style={styles.subscriptionCard}>
                <View style={styles.subscriptionContent}>
                    <Text style={styles.subscriptionLabel}>SUBSCRIPTION STATUS</Text>
                    <Text style={styles.subscriptionPlan}>YogaSathi Premium</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeText}>Active</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.manageButton}>
                    <Text style={styles.manageButtonText}>Manage</Text>
                </TouchableOpacity>
            </View>

            {/* Account Settings */}
            <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>

            <View style={styles.settingsList}>
                {settingsOptions.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.settingsItem}>
                        <View style={styles.settingsItemLeft}>
                            <View style={styles.settingsIconWrapper}>
                                <Ionicons name={item.icon} size={22} color="#4bb543" />
                            </View>
                            <Text style={styles.settingsLabel}>{item.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <View style={styles.settingsItemLeft}>
                    <View style={[styles.settingsIconWrapper, styles.logoutIconWrapper]}>
                        <Ionicons name="log-out-outline" size={22} color="#e53e3e" />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fbfdfc',
    },
    container: {
        paddingBottom: 40,
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 55,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
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
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#4bb543',
    },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#4bb543',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4bb543',
        letterSpacing: 1.5,
    },
    // Subscription Card
    subscriptionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 30,
    },
    subscriptionContent: {
        flex: 1,
    },
    subscriptionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#a0aec0',
        letterSpacing: 1,
        marginBottom: 5,
    },
    subscriptionPlan: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a202c',
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
        backgroundColor: '#4bb543',
        marginRight: 6,
    },
    activeText: {
        fontSize: 13,
        color: '#4bb543',
        fontWeight: '500',
    },
    manageButton: {
        backgroundColor: '#4bb543',
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
        color: '#a0aec0',
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
        borderBottomColor: '#f0f0f0',
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsIconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#e6f4ea',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingsLabel: {
        fontSize: 16,
        color: '#333',
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
        borderTopColor: '#f0f0f0',
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
