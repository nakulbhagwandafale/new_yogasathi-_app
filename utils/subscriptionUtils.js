/**
 * Check if a free trial subscription has expired.
 * @param {object|null} subscription - The subscription object from Supabase
 * @returns {boolean} true if trial is expired or no subscription exists
 */
export function isTrialExpired(subscription) {
    if (!subscription) return true;

    // Paid plans are never "trial expired"
    if (subscription.plan !== 'free_trial') return false;

    if (!subscription.expires_at) return false;

    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    return now > expiresAt;
}

/**
 * Get a human-readable subscription status.
 * @param {object|null} subscription
 * @returns {'expired' | 'trial' | 'active' | 'none'}
 */
export function getSubscriptionStatus(subscription) {
    if (!subscription) return 'none';

    if (subscription.plan === 'free_trial') {
        return isTrialExpired(subscription) ? 'expired' : 'trial';
    }

    return subscription.is_active ? 'active' : 'expired';
}

/**
 * Get remaining trial days.
 * @param {object|null} subscription
 * @returns {number} days remaining (0 if expired)
 */
export function getTrialDaysRemaining(subscription) {
    if (!subscription || subscription.plan !== 'free_trial' || !subscription.expires_at) return 0;

    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const diffMs = expiresAt - now;
    if (diffMs <= 0) return 0;

    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
