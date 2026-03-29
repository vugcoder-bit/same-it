export const isSubscriptionExpired = (expireDate: Date | null): boolean => {
    if (!expireDate) return true;
    const now = new Date();
    const expiry = new Date(expireDate);
    // If the date is set to 00:00:00 (start of day), we extend it to the end of the day
    // to ensure it lasts the full duration of the expiration date.
    if (expiry.getUTCHours() === 0 && expiry.getUTCMinutes() === 0 && expiry.getUTCSeconds() === 0) {
        expiry.setUTCHours(23, 59, 59, 999);
    }
    return expiry < now;
};
