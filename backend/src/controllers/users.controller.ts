import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { User, UserProfile, ApiResponse, ChallengeCompletion } from '../types';

// Mock data - will be replaced with Prisma queries once database is connected
const mockUsers: User[] = [
  {
    id: 1,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user',
    auraPoints: 150,
    streak: 5,
    lastCompletedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    email: 'user2@example.com',
    name: 'Jane Smith',
    role: 'user',
    auraPoints: 200,
    streak: 10,
    lastCompletedAt: new Date('2024-01-21'),
    createdAt: new Date('2024-01-02'),
  },
];

/**
 * GET /api/users/:id
 * Get user profile by ID
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id);
  
  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }
  
  // TODO: Get userId from authentication middleware and verify access
  // TODO: Replace with Prisma query: prisma.user.findUnique({ where: { id: userId }, include: { completions: true } })
  
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Mock completions count
  const userProfile: UserProfile = {
    ...user,
    completionsCount: Math.floor(Math.random() * 20),
  };
  
  const response: ApiResponse<UserProfile> = {
    success: true,
    data: userProfile,
  };
  
  res.json(response);
});

/**
 * GET /api/users/me
 * Get current user's profile
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Get userId from authentication middleware
  const userId = 1; // Placeholder
  
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const userProfile: UserProfile = {
    ...user,
    completionsCount: Math.floor(Math.random() * 20),
  };
  
  const response: ApiResponse<UserProfile> = {
    success: true,
    data: userProfile,
  };
  
  res.json(response);
});

/**
 * PATCH /api/users/me
 * Update current user's profile
 */
export const updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Get userId from authentication middleware
  const userId = 1; // Placeholder
  const { name } = req.body;
  
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Update user
  if (name) {
    user.name = name;
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'Profile updated successfully',
  };
  
  res.json(response);
});

/**
 * GET /api/users/:id/completions
 * Get all completions for a specific user
 */
export const getUserCompletions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id);
  
  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }
  
  // TODO: Get userId from authentication middleware and verify access
  // TODO: Replace with Prisma query:
  // prisma.challengeCompletion.findMany({
  //   where: { userId },
  //   include: { challenge: true },
  //   orderBy: { completedAt: 'desc' }
  // })
  
  // Verify user exists
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Mock completions - in real implementation, fetch from database
  const mockCompletions: ChallengeCompletion[] = [
    {
      id: 1,
      userId,
      challengeId: 1,
      latitude: 37.7749,
      longitude: -122.4194,
      completedAt: new Date('2024-01-20'),
    },
    {
      id: 2,
      userId,
      challengeId: 2,
      latitude: 37.7849,
      longitude: -122.4094,
      completedAt: new Date('2024-01-19'),
    },
  ];
  
  const response: ApiResponse<ChallengeCompletion[]> = {
    success: true,
    data: mockCompletions,
  };
  
  res.json(response);
});

