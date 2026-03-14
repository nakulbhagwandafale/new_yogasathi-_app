import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase URL or Anon Key is missing. Check your .env setup.');
}

export const supabase = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_ANON_KEY || 'placeholder');

// --- Helper Functions ---
const handleResponse = ({ data, error }, functionName) => {
    if (error) {
        console.error(`Error in ${functionName}:`, error.message);
        return { success: false, error: error.message, data: null };
    }
    return { success: true, error: null, data };
};

async function getAuthUserId() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    return data.user.id;
}

// --- Authentication Operations ---

export async function signUpUser(email, password, fullName) {
    try {
        const response = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (response.error) {
            return { success: false, error: response.error.message, data: null };
        }
        return { success: true, error: null, data: response.data };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function loginUser(email, password) {
    try {
        const response = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (response.error) {
            return { success: false, error: response.error.message, data: null };
        }
        return { success: true, error: null, data: response.data };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function getSession() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            return { success: false, error: error.message, data: null };
        }
        return { success: true, error: null, data: data.session };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function checkAssessmentExists() {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, exists: false, error: 'User not authenticated.' };

        const response = await supabase
            .from('assessments')
            .select('id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
        if (response.error) {
            return { success: false, exists: false, error: response.error.message };
        }
        return { success: true, exists: !!response.data, error: null };
    } catch (err) {
        return { success: false, exists: false, error: err.message };
    }
}

export async function fetchLatestAssessment() {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        return handleResponse(response, 'fetchLatestAssessment');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function updateAssessment(assessmentId, data) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.' };

        const response = await supabase
            .from('assessments')
            .update(data)
            .eq('id', assessmentId)
            .eq('user_id', userId)
            .select()
            .single();

        return handleResponse(response, 'updateAssessment');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, error: null };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function getCurrentUser() {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            return { success: false, error: error.message, data: null };
        }
        return { success: true, error: null, data: data.user };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

// --- Database Operations ---

export async function insertFeedback(message) {
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
            return { success: false, error: 'User not authenticated.', data: null };
        }

        const response = await supabase
            .from('feedbacks')
            .insert([{
                user_id: userData.user.id,
                message: message,
            }])
            .select()
            .single();
        return handleResponse(response, 'insertFeedback');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function insertContactMessage({ full_name, email, category, message }) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('contact_messages')
            .insert([{
                user_id: userId,
                full_name,
                email,
                category,
                message,
            }])
            .select()
            .single();

        return handleResponse(response, 'insertContactMessage');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function insertAssessment(data) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('assessments')
            .insert([{ ...data, user_id: userId }])
            .select()
            .single();
        return handleResponse(response, 'insertAssessment');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function insertDailyPlan(data) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('daily_plans')
            .insert([{ ...data, user_id: userId }])
            .select()
            .single();
        return handleResponse(response, 'insertDailyPlan');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function insertReflection(data) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('reflections')
            .insert([{ ...data, user_id: userId }])
            .select()
            .single();
        return handleResponse(response, 'insertReflection');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function insertReport(data) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('reports')
            .insert([{ ...data, user_id: userId }])
            .select()
            .single();
        return handleResponse(response, 'insertReport');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function fetchDailyPlan() {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('daily_plans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        return handleResponse(response, 'fetchDailyPlan');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function fetchReports() {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return handleResponse(response, 'fetchReports');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

// --- Subscription Operations ---

export async function createFreeTrialSubscription() {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

        const response = await supabase
            .from('subscriptions')
            .insert([{
                user_id: userId,
                plan: 'free_trial',
                started_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                is_active: true,
            }])
            .select()
            .single();
        return handleResponse(response, 'createFreeTrialSubscription');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function fetchSubscription() {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        const response = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        return handleResponse(response, 'fetchSubscription');
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

export async function activatePaidPlan(planName) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return { success: false, error: 'User not authenticated.', data: null };

        // Check if a subscription row already exists
        const existing = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existing.data) {
            // Update existing subscription
            const response = await supabase
                .from('subscriptions')
                .update({
                    plan: planName,
                    started_at: new Date().toISOString(),
                    expires_at: null, // paid plans don't expire
                    is_active: true,
                })
                .eq('id', existing.data.id)
                .eq('user_id', userId)
                .select()
                .single();
            return handleResponse(response, 'activatePaidPlan');
        } else {
            // Insert new subscription
            const response = await supabase
                .from('subscriptions')
                .insert([{
                    user_id: userId,
                    plan: planName,
                    started_at: new Date().toISOString(),
                    expires_at: null,
                    is_active: true,
                }])
                .select()
                .single();
            return handleResponse(response, 'activatePaidPlan');
        }
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

