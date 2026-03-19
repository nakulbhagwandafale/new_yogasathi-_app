/**
 * Check if a subscription has expired (works for both free trial AND paid plans).
 * @param {object|null} subscription - The subscription object from Supabase
 * @returns {boolean} true if subscription is expired or no subscription exists
 */
export function isTrialExpired(subscription) {
    if (!subscription) return true;

    // If there is an expires_at date, check if it has passed
    if (subscription.expires_at) {
        const now = new Date();
        const expiresAt = new Date(subscription.expires_at);
        return now > expiresAt;
    }

    // No expiry date set — treat as active (legacy behavior)
    return false;
}

/**
 * Get a human-readable subscription status.
 * @param {object|null} subscription
 * @returns {'expired' | 'trial' | 'active' | 'none'}
 */
export function getSubscriptionStatus(subscription) {
    if (!subscription) return 'none';

    const expired = isTrialExpired(subscription);

    if (subscription.plan === 'free_trial') {
        return expired ? 'expired' : 'trial';
    }

    // Paid plans: check expiry
    return expired ? 'expired' : 'active';
}

/**
 * Get remaining days on any subscription (trial or paid).
 * @param {object|null} subscription
 * @returns {number} days remaining (0 if expired or no expiry date)
 */
export function getTrialDaysRemaining(subscription) {
    if (!subscription || !subscription.expires_at) return 0;

    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const diffMs = expiresAt - now;
    if (diffMs <= 0) return 0;

    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
