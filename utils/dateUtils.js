/**
 * Determines whether the user can fill the reflection form for a given plan.
 *
 * Rules:
 *  - If the plan was created before 10 PM, its "target day" is that same day.
 *  - If the plan was created at or after 10 PM (auto-generated next-day plan),
 *    its "target day" is the following day.
 *  - The reflection button is enabled only after 10 PM on the target day.
 *  - If the current date is past the target day, reflection is always allowed (overdue).
 *
 * @param {string|Date} planCreatedAt - The created_at timestamp of the daily plan.
 * @returns {boolean}
 */
export function canSubmitReflection(planCreatedAt) {
    const now = new Date();

    // Fallback when no plan date is provided — use the simple hour check
    if (!planCreatedAt) {
        return now.getHours() >= 22;
    }

    const planDate = new Date(planCreatedAt);

    // Determine the plan's target day.
    // Plans generated after 10 PM are meant for the next day.
    const targetDate = new Date(planDate);
    if (planDate.getHours() >= 22) {
        targetDate.setDate(targetDate.getDate() + 1);
    }

    // Compare date-only (ignore time)
    const toDateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nowDate = toDateOnly(now);
    const targetDay = toDateOnly(targetDate);

    if (nowDate.getTime() === targetDay.getTime()) {
        // We are on the plan's target day — allow only after 10 PM
        return now.getHours() >= 22;
    }

    // If today is after the target day, reflection is overdue — allow it
    // If today is before the target day, it's too early — block it
    return nowDate > targetDay;
}
