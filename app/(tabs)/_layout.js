import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import SideDrawer from '../../components/SideDrawer';
import { useTheme } from '../../context/ThemeContext';
import { fetchSubscription } from '../../services/supabaseClient';
import { isTrialExpired } from '../../utils/subscriptionUtils';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        const result = await fetchSubscription();
        if (result.success) {
            setExpired(isTrialExpired(result.data));
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Top Navigation Bar */}
            <AppHeader onMenuPress={() => setDrawerVisible(true)} />

            {/* Tab Navigator */}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: theme.tabActive,
                    tabBarInactiveTintColor: theme.tabInactive,
                    tabBarStyle: {
                        backgroundColor: theme.tabBarBg,
                        borderTopWidth: 1,
                        borderTopColor: theme.border,
                        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                        paddingTop: 8,
                        height: 65 + (insets.bottom > 0 ? insets.bottom : 10),
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: 'Dashboard',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name={expired ? 'lock-closed' : 'bar-chart'} size={size} color={color} />
                        ),
                    }}
                    listeners={{
                        tabPress: (e) => {
                            if (expired) {
                                e.preventDefault();
                                router.push('/pricing');
                            }
                        },
                    }}
                />
                <Tabs.Screen
                    name="practice"
                    options={{
                        title: 'Practice',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="body" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="person" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="feedback"
                    options={{
                        title: 'Feedback',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>

            {/* Side Drawer Overlay */}
            <SideDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
            />
        </View>
    );
}
