export function canSubmitReflection() {
    const currentHour = new Date().getHours();
    // Allow after 10 AM (10:00)
    return currentHour >= 10;
}
