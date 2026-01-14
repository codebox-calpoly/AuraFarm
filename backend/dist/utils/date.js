"use strict";
/**
 * Date utility functions for calendar-based streak calculations
 * All dates are normalized to UTC to avoid timezone issues
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.daysBetween = exports.isConsecutiveDay = exports.isSameCalendarDay = exports.normalizeToUTCDay = void 0;
/**
 * Normalize a date to UTC midnight for calendar day comparison
 * This ensures consistent day boundaries regardless of timezone
 */
const normalizeToUTCDay = (date) => {
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return utcDate;
};
exports.normalizeToUTCDay = normalizeToUTCDay;
/**
 * Check if two dates are on the same calendar day (UTC)
 * @param date1 First date
 * @param date2 Second date
 * @returns true if both dates are on the same calendar day
 */
const isSameCalendarDay = (date1, date2) => {
    const day1 = (0, exports.normalizeToUTCDay)(date1);
    const day2 = (0, exports.normalizeToUTCDay)(date2);
    return day1.getTime() === day2.getTime();
};
exports.isSameCalendarDay = isSameCalendarDay;
/**
 * Check if date1 is exactly one calendar day before date2 (consecutive days)
 * @param date1 Earlier date
 * @param date2 Later date
 * @returns true if date1 is the calendar day before date2
 */
const isConsecutiveDay = (date1, date2) => {
    const day1 = (0, exports.normalizeToUTCDay)(date1);
    const day2 = (0, exports.normalizeToUTCDay)(date2);
    const diffTime = day2.getTime() - day1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays === 1;
};
exports.isConsecutiveDay = isConsecutiveDay;
/**
 * Calculate the number of calendar days between two dates
 * @param date1 Earlier date
 * @param date2 Later date
 * @returns Number of calendar days difference
 */
const daysBetween = (date1, date2) => {
    const day1 = (0, exports.normalizeToUTCDay)(date1);
    const day2 = (0, exports.normalizeToUTCDay)(date2);
    const diffTime = day2.getTime() - day1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
exports.daysBetween = daysBetween;
