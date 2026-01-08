import { isSameCalendarDay, isConsecutiveDay, daysBetween } from '../date';

describe('Date utility functions', () => {
  describe('isSameCalendarDay', () => {
    it('should return true for same day at different times', () => {
      const date1 = new Date('2024-01-15T08:00:00Z');
      const date2 = new Date('2024-01-15T20:00:00Z');
      expect(isSameCalendarDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15T23:00:00Z');
      const date2 = new Date('2024-01-16T01:00:00Z');
      expect(isSameCalendarDay(date1, date2)).toBe(false);
    });

    it('should handle UTC timezone correctly', () => {
      const date1 = new Date('2024-01-15T23:59:59Z');
      const date2 = new Date('2024-01-16T00:00:00Z');
      expect(isSameCalendarDay(date1, date2)).toBe(false);
    });
  });

  describe('isConsecutiveDay', () => {
    it('should return true for consecutive days', () => {
      const date1 = new Date('2024-01-15T20:00:00Z');
      const date2 = new Date('2024-01-16T08:00:00Z');
      expect(isConsecutiveDay(date1, date2)).toBe(true);
    });

    it('should return false for same day', () => {
      const date1 = new Date('2024-01-15T08:00:00Z');
      const date2 = new Date('2024-01-15T20:00:00Z');
      expect(isConsecutiveDay(date1, date2)).toBe(false);
    });

    it('should return false for gap of 2+ days', () => {
      const date1 = new Date('2024-01-15T20:00:00Z');
      const date2 = new Date('2024-01-17T08:00:00Z');
      expect(isConsecutiveDay(date1, date2)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days correctly', () => {
      const date1 = new Date('2024-01-15T00:00:00Z');
      const date2 = new Date('2024-01-17T00:00:00Z');
      expect(daysBetween(date1, date2)).toBe(2);
    });
  });
});