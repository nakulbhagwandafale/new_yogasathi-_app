import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';
import { createRazorpayPaymentLink, fetchSubscription } from '../services/supabaseClient';

const PLANS = [
    {
        id: 'free_trial',
        name: 'Free Trial',
        price: '₹0',
        numericPrice: 0,
        period: '3 days',
        icon: 'leaf-outline',
        color: '#4bb543',
        bgColor: '#e8f5e9',
        features: [
            'Personalized Yoga Plan',
            'AI Nutrition Guide',
            'Daily Reflection',
            'Basic Reports',
        ],
        isCurrent: false,
    },
    {
        id: 'monthly',
        name: 'Monthly',
        price: '₹1',
        numericPrice: 1, // Change to 499 for production
        period: '/month',
        icon: 'star-outline',
        color: '#1976d2',
        bgColor: '#e3f2fd',
        features: [
            'Everything in Free Trial',
            'Unlimited Plan Generation',
            'Advanced AI Reports',
            'Priority Support',
            'Yoga Video Library',
        ],
        popular: true,
        isCurrent: false,
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: '₹2',
        numericPrice: 2, // Change to 4999 for production
        period: '/year',
        icon: 'diamond-outline',
        color: '#7b1fa2',
        bgColor: '#f3e5f5',
        features: [
            'Everything in Monthly',
            'Save 58% vs Monthly',
            'Exclusive Wellness Content',
            'Personal Wellness Coach',
            'Early Access to Features',
        ],
        isCurrent: false,
    },
];

export default function PricingPage() {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const handleSelectPlan = async (plan) => {
        if (plan.id === 'free_trial') return;

        setSelectedPlan(plan.id);
        setIsLoading(true);

        try {
            // 1. Generate Razorpay Payment Link securely via Edge Function
            const linkResult = await createRazorpayPaymentLink(plan.name, plan.numericPrice);

            if (!linkResult.success || !linkResult.data?.short_url) {
                Alert.alert('Payment Error', linkResult.error || 'Could not generate payment link.');
                setIsLoading(false);
                setSelectedPlan(null);
                return;
            }

            // 2. Open the Razorpay link in the in-app browser
            const paymentUrl = linkResult.data.short_url;
            await WebBrowser.openBrowserAsync(paymentUrl);

            // 3. User closed the browser. Check if the webhook successfully updated the plan.
            const subCheck = await fetchSubscription();
            
            if (subCheck.success && subCheck.data) {
                // If the webhook worked, their plan string will now match the name (e.g., "Monthly")
                if (subCheck.data.plan === plan.name.toLowerCase() || subCheck.data.plan === plan.name) {
                    Alert.alert(
                        'Payment Successful! 🎉',
                        `You are now on the ${plan.name} plan. Enjoy all premium features!`,
                        [{ text: 'Start Exploring', onPress: () => router.replace('/(tabs)/home') }]
                    );
                    return; // exit safely
                }
            }
            
            // If we get here, payment failed or webhook hasn't processed yet
            Alert.alert(
                'Payment Status',
                'Your payment was either cancelled or is still processing. If successful, your plan will activate shortly.'
            );

        } catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
            setSelectedPlan(null);
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
                {router.canGoBack() ? (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={22} color={theme.primary} />
                    </TouchableOpacity>
                ) : (
                    // Empty placeholder to keep the title centered
                    <View style={styles.backBtn} />
                )}
                <Text style={[styles.headerTitle, { color: theme.text }]}>Choose Your Plan</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={[styles.heroIconWrap, { backgroundColor: theme.accent }]}>
                        <Ionicons name="sparkles" size={32} color={theme.primary} />
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.text }]}>Upgrade Your Wellness</Text>
                    <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                        Unlock the full power of AI-driven yoga and nutrition coaching
                    </Text>
                </View>

                {/* Plan Cards */}
                {PLANS.map((plan) => (
                    <View
                        key={plan.id}
                        style={[
                            styles.planCard,
                            {
                                backgroundColor: theme.card,
                                borderColor: plan.popular ? plan.color : theme.border,
                                borderWidth: plan.popular ? 2 : 1,
                            },
                        ]}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                            </View>
                        )}

                        {/* Plan Header */}
                        <View style={styles.planHeader}>
                            <View style={[styles.planIconWrap, { backgroundColor: plan.bgColor }]}>
                                <Ionicons name={plan.icon} size={24} color={plan.color} />
                            </View>
                            <View style={styles.planHeaderText}>
                                <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                                    <Text style={[styles.planPeriod, { color: theme.textMuted }]}>{plan.period}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Features */}
                        <View style={styles.featuresContainer}>
                            {plan.features.map((feature, idx) => (
                                <View key={idx} style={styles.featureRow}>
                                    <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>{feature}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Action Button */}
                        {plan.id === 'free_trial' ? (
                            <View style={[styles.currentPlanBadge, { backgroundColor: theme.accent }]}>
                                <Text style={[styles.currentPlanText, { color: theme.primary }]}>Current Plan</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.choosePlanBtn, { backgroundColor: plan.color }]}
                                onPress={() => handleSelectPlan(plan)}
                                disabled={isLoading}
                                activeOpacity={0.85}
                            >
                                {isLoading && selectedPlan === plan.id ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.choosePlanBtnText}>Choose {plan.name}</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {/* Footer Note */}
                <View style={styles.footerNote}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={theme.textMuted} />
                    <Text style={[styles.footerNoteText, { color: theme.textMuted }]}>
                        Secure payment • Cancel anytime • Instant access
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    container: {
        paddingBottom: 40,
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 28,
        paddingBottom: 10,
    },
    heroIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Plan Cards
    planCard: {
        marginHorizontal: 20,
        marginTop: 18,
        borderRadius: 16,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    popularBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderBottomLeftRadius: 12,
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },

    // Plan Header
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    planIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    planHeaderText: {
        flex: 1,
    },
    planName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    planPrice: {
        fontSize: 26,
        fontWeight: '800',
    },
    planPeriod: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 2,
    },

    // Features
    featuresContainer: {
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureText: {
        fontSize: 14,
        marginLeft: 10,
        fontWeight: '500',
    },

    // Buttons
    currentPlanBadge: {
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
    },
    currentPlanText: {
        fontSize: 14,
        fontWeight: '700',
    },
    choosePlanBtn: {
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    choosePlanBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    // Footer
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
    },
    footerNoteText: {
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500',
    },
});
