import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@yogasathi_dark_mode';

const lightTheme = {
    isDark: false,
    // Backgrounds
    background: '#fbfdfc',
    surface: '#ffffff',
    card: '#ffffff',
    headerBg: '#ffffff',
    tabBarBg: '#ffffff',
    drawerBg: '#ffffff',
    // Text
    text: '#1a202c',
    textSecondary: '#718096',
    textMuted: '#a0aec0',
    // Accents
    primary: '#2e7d32',
    primaryLight: '#4bb543',
    accent: '#e8f5e9',
    // Borders & Dividers
    border: '#e2e8f0',
    divider: '#f0f0f0',
    // Tab bar
    tabActive: '#2e7d32',
    tabInactive: '#999',
    // Shadows
    shadow: '#000',
    // Header specific
    headerShadow: 'rgba(0,0,0,0.06)',
    // Charts
    chartBgFrom: '#ffffff',
    chartBgTo: '#ffffff',
    chartLabel: 'rgba(0,0,0,1)',
    // Input
    inputBg: '#ffffff',
    inputBorder: '#e2e8f0',
    inputText: '#2d3748',
    placeholder: '#a0aec0',
    // Status bar
    statusBarStyle: 'dark',
};

const darkTheme = {
    isDark: true,
    // Backgrounds
    background: '#0f1115',
    surface: '#1a1d23',
    card: '#1e2028',
    headerBg: '#14161b',
    tabBarBg: '#14161b',
    drawerBg: '#14161b',
    // Text
    text: '#e8eaed',
    textSecondary: '#9aa0a6',
    textMuted: '#71767b',
    // Accents
    primary: '#66bb6a',
    primaryLight: '#81c784',
    accent: '#1b3a1d',
    // Borders & Dividers
    border: '#2c2f36',
    divider: '#23262d',
    // Tab bar
    tabActive: '#81c784',
    tabInactive: '#71767b',
    // Shadows
    shadow: '#000',
    // Header specific
    headerShadow: 'rgba(0,0,0,0.3)',
    // Charts
    chartBgFrom: '#1a1d23',
    chartBgTo: '#1a1d23',
    chartLabel: 'rgba(255,255,255,0.8)',
    // Input
    inputBg: '#1e2028',
    inputBorder: '#2c2f36',
    inputText: '#e8eaed',
    placeholder: '#71767b',
    // Status bar
    statusBarStyle: 'light',
};

const ThemeContext = createContext({
    theme: lightTheme,
    isDarkMode: false,
    toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(THEME_KEY);
                if (stored === 'true') {
                    setIsDarkMode(true);
                }
            } catch (e) {
                // ignore
            }
            setIsLoaded(true);
        })();
    }, []);

    const toggleTheme = async () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        try {
            await AsyncStorage.setItem(THEME_KEY, next ? 'true' : 'false');
        } catch (e) {
            // ignore
        }
    };

    const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    const value = useMemo(() => ({ theme, isDarkMode, toggleTheme }), [theme, isDarkMode]);

    // Don't render until we've loaded the persisted preference
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
