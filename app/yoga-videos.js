import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { YOGA_VIDEOS } from '../constants/yogaVideos';

export default function YogaVideos() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');

    // Pre-sort the videos alphabetically securely
    const sortedVideos = useMemo(() => {
        return [...YOGA_VIDEOS].sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    // Filter videos based on search input
    const filteredVideos = useMemo(() => {
        if (!searchQuery.trim()) return sortedVideos;
        const lowerQuery = searchQuery.toLowerCase();
        return sortedVideos.filter(
            (video) =>
                video.name.toLowerCase().includes(lowerQuery) ||
                video.sanskrit.toLowerCase().includes(lowerQuery) ||
                video.description.toLowerCase().includes(lowerQuery)
        );
    }, [searchQuery, sortedVideos]);

    const handleOpenVideo = (url) => {
        Linking.openURL(url).catch((err) =>
            console.error('Failed to open Google Drive Link:', err)
        );
    };

    const renderVideoCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.7}
            onPress={() => handleOpenVideo(item.url)}
        >
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: theme.accent }]}>
                    <Ionicons name="play" size={24} color={theme.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.poseName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.sanskritName, { color: theme.textSecondary }]}>{item.sanskrit}</Text>
                </View>
                <Ionicons name="open-outline" size={20} color={theme.textMuted} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + 10 : 10 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Yoga Video Library</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                        <Ionicons name="search" size={20} color={theme.placeholder} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.inputText }]}
                            placeholder="Search poses (e.g., Downward Dog)..."
                            placeholderTextColor={theme.placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                                <Ionicons name="close-circle" size={18} color={theme.placeholder} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Video List */}
                <FlatList
                    data={filteredVideos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderVideoCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="videocam-off-outline" size={48} color={theme.textMuted} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No yoga videos found matching "{searchQuery}"
                            </Text>
                        </View>
                    }
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    clearIcon: {
        padding: 5,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    poseName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    sanskritName: {
        fontSize: 13,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 15,
        textAlign: 'center',
    },
});
