import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { prisma } from '../prisma';
import { FriendshipStatus } from '@prisma/client';
import { getAcceptedFriendIds } from '../utils/friendship';

/**
 * POST /api/friends/request { targetUserId }
 */
export const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const targetUserId = Number((req.body as { targetUserId?: number }).targetUserId);
  if (!Number.isInteger(targetUserId) || targetUserId < 1) {
    throw new AppError('Invalid targetUserId', 400);
  }
  const me = req.user.id;
  if (targetUserId === me) {
    throw new AppError('You cannot send a friend request to yourself', 400);
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
  if (!target) {
    throw new AppError('User not found', 404);
  }

  const forward = await prisma.friendship.findUnique({
    where: {
      requesterId_addresseeId: { requesterId: me, addresseeId: targetUserId },
    },
  });
  const reverse = await prisma.friendship.findUnique({
    where: {
      requesterId_addresseeId: { requesterId: targetUserId, addresseeId: me },
    },
  });

  if (forward?.status === FriendshipStatus.accepted || reverse?.status === FriendshipStatus.accepted) {
    throw new AppError('You are already friends', 409);
  }
  if (forward?.status === FriendshipStatus.pending) {
    throw new AppError('Friend request already sent', 409);
  }
  if (reverse?.status === FriendshipStatus.pending) {
    throw new AppError('This user already sent you a request — accept it from Incoming', 409);
  }

  const row = await prisma.friendship.create({
    data: {
      requesterId: me,
      addresseeId: targetUserId,
      status: FriendshipStatus.pending,
    },
    include: {
      addressee: { select: { id: true, name: true } },
    },
  });

  const response: ApiResponse<typeof row> = {
    success: true,
    data: row,
    message: 'Friend request sent',
  };
  res.status(201).json(response);
});

/**
 * POST /api/friends/accept { requesterId }
 */
export const acceptFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const requesterId = Number((req.body as { requesterId?: number }).requesterId);
  if (!Number.isInteger(requesterId) || requesterId < 1) {
    throw new AppError('Invalid requesterId', 400);
  }
  const me = req.user.id;

  const row = await prisma.friendship.findUnique({
    where: {
      requesterId_addresseeId: { requesterId, addresseeId: me },
    },
  });

  if (!row || row.status !== FriendshipStatus.pending) {
    throw new AppError('No pending request from this user', 404);
  }

  const updated = await prisma.friendship.update({
    where: { id: row.id },
    data: { status: FriendshipStatus.accepted },
    include: {
      requester: { select: { id: true, name: true } },
    },
  });

  const response: ApiResponse<typeof updated> = {
    success: true,
    data: updated,
    message: 'You are now friends',
  };
  res.json(response);
});

/**
 * POST /api/friends/decline { requesterId }
 */
export const declineFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const requesterId = Number((req.body as { requesterId?: number }).requesterId);
  if (!Number.isInteger(requesterId) || requesterId < 1) {
    throw new AppError('Invalid requesterId', 400);
  }
  const me = req.user.id;

  const deleted = await prisma.friendship.deleteMany({
    where: {
      requesterId,
      addresseeId: me,
      status: FriendshipStatus.pending,
    },
  });

  if (deleted.count === 0) {
    throw new AppError('No pending request from this user', 404);
  }

  res.json({ success: true, message: 'Request declined' });
});

/**
 * DELETE /api/friends/outgoing/:targetUserId — cancel a pending request you sent
 */
export const cancelOutgoingRequest = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const targetUserId = parseInt(req.params.targetUserId, 10);
  if (Number.isNaN(targetUserId)) {
    throw new AppError('Invalid user id', 400);
  }
  const me = req.user.id;

  const deleted = await prisma.friendship.deleteMany({
    where: {
      requesterId: me,
      addresseeId: targetUserId,
      status: FriendshipStatus.pending,
    },
  });

  if (deleted.count === 0) {
    throw new AppError('No outgoing request to this user', 404);
  }

  res.json({ success: true, message: 'Request cancelled' });
});

/**
 * DELETE /api/friends/:userId — unfriend
 */
export const removeFriend = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const otherId = parseInt(req.params.userId, 10);
  if (Number.isNaN(otherId)) {
    throw new AppError('Invalid user id', 400);
  }
  const me = req.user.id;
  if (otherId === me) {
    throw new AppError('Invalid user', 400);
  }

  const deleted = await prisma.friendship.deleteMany({
    where: {
      status: FriendshipStatus.accepted,
      OR: [
        { requesterId: me, addresseeId: otherId },
        { requesterId: otherId, addresseeId: me },
      ],
    },
  });

  if (deleted.count === 0) {
    throw new AppError('Not friends with this user', 404);
  }

  res.json({ success: true, message: 'Removed from friends' });
});

/**
 * GET /api/friends — accepted friends
 */
export const listFriends = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const me = req.user.id;

  const rows = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.accepted,
      OR: [{ requesterId: me }, { addresseeId: me }],
    },
    include: {
      requester: { select: { id: true, name: true, auraPoints: true } },
      addressee: { select: { id: true, name: true, auraPoints: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const friends = rows.map((r) => {
    const u = r.requesterId === me ? r.addressee : r.requester;
    return { id: u.id, name: u.name, auraPoints: u.auraPoints, since: r.updatedAt };
  });

  const response: ApiResponse<typeof friends> = {
    success: true,
    data: friends,
  };
  res.json(response);
});

/**
 * GET /api/friends/incoming
 */
export const listIncomingRequests = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const me = req.user.id;

  const rows = await prisma.friendship.findMany({
    where: { addresseeId: me, status: FriendshipStatus.pending },
    include: {
      requester: { select: { id: true, name: true, auraPoints: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = rows.map((r) => ({
    id: r.id,
    requester: r.requester,
    createdAt: r.createdAt,
  }));

  const response: ApiResponse<typeof data> = {
    success: true,
    data,
  };
  res.json(response);
});

/**
 * GET /api/friends/outgoing
 */
export const listOutgoingRequests = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const me = req.user.id;

  const rows = await prisma.friendship.findMany({
    where: { requesterId: me, status: FriendshipStatus.pending },
    include: {
      addressee: { select: { id: true, name: true, auraPoints: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = rows.map((r) => ({
    id: r.id,
    addressee: r.addressee,
    createdAt: r.createdAt,
  }));

  const response: ApiResponse<typeof data> = {
    success: true,
    data,
  };
  res.json(response);
});
