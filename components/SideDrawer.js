import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { logoutUser } from '../services/supabaseClient';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;
const navItems = [
    { icon: 'home-outline', label: 'Home', route: '/(tabs)/home' },
    { icon: 'person-outline', label: 'Profile', route: '/(tabs)/profile' },
    { icon: 'chatbubble-ellipses-outline', label: 'Feedback', route: '/(tabs)/feedback' },
    { icon: 'bulb-outline', label: 'How It Works', route: '/how-it-works' },
    { icon: 'help-circle-outline', label: 'FAQs', route: '/faqs' },
    { icon: 'call-outline', label: 'Contact', route: '/contact' },
    { icon: 'information-circle-outline', label: 'About Us', route: '/about' },
];

export default function SideDrawer({ visible, onClose }) {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();

    const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: DRAWER_WIDTH,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleNav = (route) => {
        onClose();
        setTimeout(() => {
            router.push(route);
        }, 250);
    };

    const handleLogout = async () => {
        onClose();
        await logoutUser();
        router.replace('/login');
    };

    return (
        <View style={[styles.wrapper, { pointerEvents: visible ? 'auto' : 'none' }]}>
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
            </TouchableWithoutFeedback>

            {/* Drawer Panel */}
            <Animated.View
                style={[
                    styles.drawer,
                    {
                        backgroundColor: theme.drawerBg,
                        transform: [{ translateX: slideAnim }],
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 20,
                    },
                ]}
            >
                {/* Header */}
                <View style={styles.drawerHeader}>
                    <View style={[styles.drawerLogoCircle, { backgroundColor: theme.accent }]}>
                        <Ionicons name="leaf" size={26} color={theme.primaryLight} />
                    </View>
                    <Text style={[styles.drawerBrand, { color: theme.text }]}>
                        Yoga<Text style={{ color: theme.primaryLight }}>Sathi</Text>
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.drawerDivider, { backgroundColor: theme.divider }]} />

                {/* Nav Items */}
                <View style={styles.navList}>
                    {navItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.navItem}
                            onPress={() => handleNav(item.route)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.navIconWrap, { backgroundColor: theme.accent }]}>
                                <Ionicons name={item.icon} size={20} color={theme.primary} />
                            </View>
                            <Text style={[styles.navLabel, { color: theme.text }]}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.drawerDivider, { backgroundColor: theme.divider }]} />

                {/* Theme Toggle Row */}
                <TouchableOpacity
                    style={styles.themeRow}
                    onPress={toggleTheme}
                    activeOpacity={0.7}
                >
                    <View style={[styles.navIconWrap, { backgroundColor: isDarkMode ? '#332b00' : '#fffbeb' }]}>
                        <Ionicons
                            name={isDarkMode ? 'moon' : 'sunny'}
                            size={20}
                            color={isDarkMode ? '#fbbf24' : '#f59e0b'}
                        />
                    </View>
                    <Text style={[styles.navLabel, { color: theme.text }]}>
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                    <View style={[styles.toggleTrack, { backgroundColor: isDarkMode ? theme.primary : '#e2e8f0' }]}>
                        <View
                            style={[
                                styles.toggleThumb,
                                { transform: [{ translateX: isDarkMode ? 16 : 0 }] },
                            ]}
                        />
                    </View>
                </TouchableOpacity>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.logoutBtn, { borderColor: theme.border }]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: DRAWER_WIDTH,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: -3, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 20,
    },
    /* Header */
    drawerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    drawerLogoCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    drawerBrand: {
        fontSize: 22,
        fontWeight: '800',
        flex: 1,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerDivider: {
        height: 1,
        marginVertical: 10,
    },
    /* Nav Items */
    navList: {
        marginTop: 5,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
    },
    navIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    navLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    /* Theme toggle */
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 5,
    },
    toggleTrack: {
        width: 40,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    /* Logout */
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderWidth: 1,
        borderRadius: 14,
        gap: 8,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ef4444',
    },
});
