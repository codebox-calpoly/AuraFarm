/**
 * Date utility functions for calendar-based streak calculations
 * All dates are normalized to UTC to avoid timezone issues
 */

/**
 * Normalize a date to UTC midnight for calendar day comparison
 * This ensures consistent day boundaries regardless of timezone
 */
export const normalizeToUTCDay = (date: Date): Date => {
    const utcDate = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ));
    return utcDate;
}

/**
 * Check if two dates are on the same calendar day (UTC)
 * @param date1 First date
 * @param date2 Second date
 * @returns true if both dates are on the same calendar day
 */
export const isSameCalendarDay = (date1: Date, date2: Date): boolean => {
    const day1 = normalizeToUTCDay(date1);
    const day2 = normalizeToUTCDay(date2);
    return day1.getTime() === day2.getTime();
}

/**
 * Check if date1 is exactly one calendar day before date2 (consecutive days)
 * @param date1 Earlier date
 * @param date2 Later date
 * @returns true if date1 is the calendar day before date2
 */
export const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
    const day1 = normalizeToUTCDay(date1);
    const day2 = normalizeToUTCDay(date2);
    const diffTime = day2.getTime() - day1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays === 1;
}

/**
 * Calculate the number of calendar days between two dates
 * @param date1 Earlier date
 * @param date2 Later date
 * @returns Number of calendar days difference
 */
export const daysBetween = (date1: Date, date2: Date): number => {
    const day1 = normalizeToUTCDay(date1);
    const day2 = normalizeToUTCDay(date2);
    const diffTime = day2.getTime() - day1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}