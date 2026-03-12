import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { signUpUser } from '../services/supabaseClient';

export default function SignUp() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        if (!fullName || !email || !password) {
            Alert.alert('Missing Info', 'Please fill out all fields.');
            return;
        }

        if (!agreedToTerms) {
            Alert.alert('Terms Required', 'You must agree to the Terms of Service and Privacy Policy.');
            return;
        }

        setIsLoading(true);

        const { success, error } = await signUpUser(email, password, fullName);

        setIsLoading(false);

        if (success) {
            router.replace('/assessment');
        } else {
            Alert.alert('Sign Up Failed', error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* Top Logo / Icon */}
                <View style={styles.logoContainer}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="body" size={32} color="#4bb543" />
                    </View>
                </View>

                {/* Header Text */}
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>
                    Join our community of yoga{'\n'}enthusiasts today.
                </Text>

                {/* Full Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person" size={20} color="#a0aec0" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor="#a0aec0"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail" size={20} color="#a0aec0" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="user@example.com"
                            placeholderTextColor="#a0aec0"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed" size={20} color="#a0aec0" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            placeholderTextColor="#a0aec0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={isPasswordVisible ? 'eye-off' : 'eye'}
                                size={20}
                                color="#a0aec0"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Terms and Conditions */}
                <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                        style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
                        onPress={() => setAgreedToTerms(!agreedToTerms)}
                    >
                        {agreedToTerms && <Ionicons name="checkmark" size={16} color="#4bb543" />}
                    </TouchableOpacity>
                    <Text style={styles.checkboxText}>
                        I agree to the{' '}
                        <Text
                            style={styles.linkText}
                            onPress={() => router.push('/terms')}
                        >Terms & Conditions</Text> and{' '}
                        <Text
                            style={styles.linkText}
                            onPress={() => router.push('/privacy')}
                        >Privacy Policy</Text>
                    </Text>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                    style={[styles.button, (!fullName || !email || !password || !agreedToTerms) && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={isLoading || !fullName || !email || !password || !agreedToTerms}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={styles.footerLink}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: '#fbfdfc', // Very light green/gray tint
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 20,
    },
    iconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#e6f4ea', // Light green background for icon
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a202c', // Dark blue-gray
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4a5568',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff', // White interior
        borderWidth: 1,
        borderColor: '#e2e8f0', // Light gray border
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#2d3748',
        height: '100%',
    },
    eyeIcon: {
        padding: 5,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        marginBottom: 30,
        paddingRight: 20, // Prevents text from hugging the very edge
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#cbd5e0', // Slightly darker gray for circle
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        borderColor: '#4bb543',
    },
    checkboxText: {
        fontSize: 13,
        color: '#718096',
        flex: 1, // Wrap text properly
        lineHeight: 18,
    },
    linkText: {
        color: '#4bb543', // Green text for terms
        fontWeight: '500',
    },
    button: {
        width: '100%',
        height: 55,
        backgroundColor: '#4bb543', // Primary green
        borderRadius: 28, // Pill shape
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#4bb543',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#9ae6b4', // Lighter green when disabled
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#718096',
    },
    footerLink: {
        fontSize: 14,
        color: '#4bb543',
        fontWeight: 'bold',
    },
});
