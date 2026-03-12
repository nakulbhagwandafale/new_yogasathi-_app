import { Ionicons } from '@expo/vector-icons';
import { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function AppHeader({ onMenuPress }) {
    const insets = useSafeAreaInsets();
    const { theme, isDarkMode, toggleTheme } = useTheme();

    // Animate the toggle icon rotation
    const rotateAnim = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(rotateAnim, {
            toValue: isDarkMode ? 1 : 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    }, [isDarkMode]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 8,
                    backgroundColor: theme.headerBg,
                    borderBottomColor: theme.border,
                    shadowColor: theme.shadow,
                },
            ]}
        >
            {/* Left — Logo */}
            <View style={styles.leftSection}>
                <View style={[styles.logoCircle, { backgroundColor: theme.accent }]}>
                    <Ionicons name="leaf" size={20} color={theme.primaryLight} />
                </View>
                <Text style={[styles.brandText, { color: theme.text }]}>
                    Yoga<Text style={{ color: theme.primaryLight }}>Sathi</Text>
                </Text>
            </View>

            {/* Right — Actions */}
            <View style={styles.rightSection}>
                {/* Dark/Light Toggle */}
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: theme.accent }]}
                    onPress={toggleTheme}
                    activeOpacity={0.7}
                >
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Ionicons
                            name={isDarkMode ? 'moon' : 'sunny'}
                            size={20}
                            color={isDarkMode ? '#fbbf24' : '#f59e0b'}
                        />
                    </Animated.View>
                </TouchableOpacity>

                {/* Hamburger Menu */}
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: theme.accent }]}
                    onPress={onMenuPress}
                >
                    <Ionicons name="menu" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    /* Left */
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    brandText: {
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    /* Right */
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
