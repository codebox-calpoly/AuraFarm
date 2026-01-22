"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../prisma");
const completions_controller_1 = require("../completions.controller");
const dateUtils = __importStar(require("../../utils/date"));
jest.mock('../../prisma', () => ({
    prisma: {
        challenge: {
            findUnique: jest.fn(),
        },
        challengeCompletion: {
            findUnique: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));
// Mock geo utility - we don't want to test distance calculation in this test
jest.mock('../../utils/geo', () => ({
    calculateDistance: jest.fn(() => 50), // Always return 50m (within range)
}));
// Mock date utilities to control calendar day comparisons
jest.mock('../../utils/date', () => ({
    isSameCalendarDay: jest.fn(),
    isConsecutiveDay: jest.fn(),
    normalizeToUTCDay: jest.fn(),
    daysBetween: jest.fn(),
}));
describe('Streak Logic in completeChallenge', () => {
    let mockRequest;
    let mockResponse;
    let mockTransaction;
    let mockNext;
    const userUpdateCalls = []; // Initialize once, never reassign
    beforeEach(() => {
        // Clear call tracking (don't reassign, just clear the array)
        userUpdateCalls.length = 0;
        // Create transaction mock object with manual call tracking
        const mockUserUpdate = jest.fn((...args) => {
            // Store the call arguments manually
            userUpdateCalls.push(args[0]);
            return Promise.resolve({});
        });
        mockTransaction = {
            challengeCompletion: {
                create: jest.fn().mockResolvedValue({
                    id: 1,
                    userId: 1,
                    challengeId: 1,
                    latitude: 40.7128,
                    longitude: -74.0006,
                    completedAt: new Date(),
                }),
            },
            user: {
                findUnique: jest.fn(),
                update: mockUserUpdate,
            },
        };
        // Setup transaction mock
        prisma_1.prisma.$transaction.mockReset();
        prisma_1.prisma.$transaction.mockImplementation(async (callback) => {
            const result = await callback(mockTransaction);
            return result;
        });
        // Default request object
        mockRequest = {
            body: {
                challengeId: 1,
                latitude: 40.7128,
                longitude: -74.0006,
            },
        };
        // Default response object
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
        // Default: challenge exists
        prisma_1.prisma.challenge.findUnique.mockResolvedValue({
            id: 1,
            title: 'Test Challenge',
            latitude: 40.7128,
            longitude: -74.0060,
            pointsReward: 10,
        });
        // Default: no existing completion
        prisma_1.prisma.challengeCompletion.findUnique.mockResolvedValue(null);
        // Reset date utility mocks with default implementations
        dateUtils.isSameCalendarDay.mockClear();
        dateUtils.isConsecutiveDay.mockClear();
        // Default: use real implementations (will be overridden in specific tests)
        dateUtils.isSameCalendarDay.mockImplementation((date1, date2) => {
            const day1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
            const day2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));
            return day1.getTime() === day2.getTime();
        });
        dateUtils.isConsecutiveDay.mockImplementation((date1, date2) => {
            const day1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
            const day2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));
            const diffTime = day2.getTime() - day1.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays === 1;
        });
    });
    it('should set streak to 1 for first completion ever', async () => {
        // User has never completed anything
        mockTransaction.user.findUnique.mockResolvedValue({
            id: 1,
            streak: 0,
            lastCompletedAt: null,
        });
        await (0, completions_controller_1.completeChallenge)(mockRequest, mockResponse, mockNext);
        // Wait for next event loop cycle to ensure all async operations complete
        await new Promise(resolve => setImmediate(resolve));
        expect(mockNext).not.toHaveBeenCalled();
        // Check that user.update was called with streak = 1
        expect(userUpdateCalls.length).toBe(1);
        expect(userUpdateCalls[0]).toMatchObject({
            where: { id: 1 },
            data: expect.objectContaining({
                streak: 1,
            }),
        });
    });
    it('should not increment streak for same day completion', async () => {
        const today = new Date('2024-01-15T12:00:00Z');
        const earlierToday = new Date('2024-01-15T08:00:00Z');
        // Mock date utilities to return same day
        dateUtils.isSameCalendarDay.mockReturnValue(true);
        dateUtils.isConsecutiveDay.mockReturnValue(false);
        // User already completed something today
        mockTransaction.user.findUnique.mockResolvedValue({
            id: 1,
            streak: 5,
            lastCompletedAt: earlierToday,
        });
        await (0, completions_controller_1.completeChallenge)(mockRequest, mockResponse, mockNext);
        // Wait for next event loop cycle to ensure all async operations complete
        await new Promise(resolve => setImmediate(resolve));
        expect(mockNext).not.toHaveBeenCalled();
        // Streak should stay the same (5)
        expect(userUpdateCalls.length).toBe(1);
        expect(userUpdateCalls[0]).toMatchObject({
            where: { id: 1 },
            data: expect.objectContaining({
                streak: 5, // No change
            }),
        });
    });
    it('should increment streak for consecutive day completion', async () => {
        const today = new Date('2024-01-16T12:00:00Z');
        const yesterday = new Date('2024-01-15T12:00:00Z');
        // Mock date utilities to return consecutive day
        dateUtils.isSameCalendarDay.mockReturnValue(false);
        dateUtils.isConsecutiveDay.mockReturnValue(true);
        // User completed yesterday
        mockTransaction.user.findUnique.mockResolvedValue({
            id: 1,
            streak: 5,
            lastCompletedAt: yesterday,
        });
        await (0, completions_controller_1.completeChallenge)(mockRequest, mockResponse, mockNext);
        // Wait for next event loop cycle to ensure all async operations complete
        await new Promise(resolve => setImmediate(resolve));
        expect(mockNext).not.toHaveBeenCalled();
        // Streak should increment to 6
        expect(userUpdateCalls.length).toBe(1);
        expect(userUpdateCalls[0]).toMatchObject({
            where: { id: 1 },
            data: expect.objectContaining({
                streak: 6, // Incremented
            }),
        });
    });
    it('should reset streak to 1 when user misses a day', async () => {
        const today = new Date('2024-01-17T12:00:00Z');
        const twoDaysAgo = new Date('2024-01-15T12:00:00Z');
        // Mock date utilities to return gap (not same day, not consecutive)
        dateUtils.isSameCalendarDay.mockReturnValue(false);
        dateUtils.isConsecutiveDay.mockReturnValue(false);
        // User last completed 2 days ago (missed a day)
        mockTransaction.user.findUnique.mockResolvedValue({
            id: 1,
            streak: 10,
            lastCompletedAt: twoDaysAgo,
        });
        await (0, completions_controller_1.completeChallenge)(mockRequest, mockResponse, mockNext);
        // Wait for next event loop cycle to ensure all async operations complete
        await new Promise(resolve => setImmediate(resolve));
        expect(mockNext).not.toHaveBeenCalled();
        // Streak should reset to 1
        expect(userUpdateCalls.length).toBe(1);
        expect(userUpdateCalls[0]).toMatchObject({
            where: { id: 1 },
            data: expect.objectContaining({
                streak: 1, // Reset
            }),
        });
    });
});
