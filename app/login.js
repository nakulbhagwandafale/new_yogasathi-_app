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
import { checkAssessmentExists, loginUser, fetchSubscription } from '../services/supabaseClient';
import { isTrialExpired } from '../utils/subscriptionUtils';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Info', 'Please enter your email and password.');
            return;
        }

        setIsLoading(true);

        try {
            const loginResult = await loginUser(email, password);

            if (!loginResult.success) {
                setIsLoading(false);
                Alert.alert('Login Failed', loginResult.error);
                return;
            }

            // Check if user has completed assessment before
            const assessmentResult = await checkAssessmentExists();

            setIsLoading(false);

            if (assessmentResult.exists) {
                // Check subscription status
                const subResult = await fetchSubscription();
                if (subResult.success && isTrialExpired(subResult.data)) {
                    router.replace('/pricing');
                } else {
                    router.replace('/(tabs)/home');
                }
            } else {
                // First-time user — go to assessment
                router.replace('/assessment');
            }
        } catch (err) {
            setIsLoading(false);
            Alert.alert('Error', 'Something went wrong. Please try again.');
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

                {/* Brand Name */}
                <Text style={styles.brandName}>YOGASATHI AI</Text>

                {/* Header Text */}
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Continue your wellness journey with us</Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone or Email</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail" size={20} color="#a0aec0" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your phone or email"
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
                    <View style={styles.passwordLabelRow}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TouchableOpacity>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed" size={20} color="#a0aec0" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
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

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.button, (!email || !password) && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading || !email || !password}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login to Home Page</Text>
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or continue with</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-google" size={18} color="#333" />
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-apple" size={18} color="#333" />
                        <Text style={styles.socialText}>Apple</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text style={styles.footerLink}>Start free trial</Text>
                    </TouchableOpacity>
                </View>

                {/* Copyright */}
                <Text style={styles.copyright}>© 2024 YogaSathi AI. All rights reserved.</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: '#fbfdfc',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 70,
        paddingBottom: 30,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 12,
    },
    iconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#e6f4ea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4bb543',
        letterSpacing: 2,
        marginBottom: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 35,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 20,
    },
    passwordLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4a5568',
    },
    forgotText: {
        fontSize: 13,
        color: '#4bb543',
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
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
    button: {
        width: '100%',
        height: 55,
        backgroundColor: '#4bb543',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#4bb543',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#9ae6b4',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 13,
        color: '#a0aec0',
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 30,
        gap: 15,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 30,
        backgroundColor: '#fff',
    },
    socialText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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
    copyright: {
        fontSize: 12,
        color: '#a0aec0',
        textAlign: 'center',
    },
});
