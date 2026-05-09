import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { prisma } from '../prisma';
import { sendModerationNotification } from '../utils/email';
import logger from '../utils/logger';

/**
 * POST /api/blocks
 * Block another user. The block is mutual in effect: the blocker stops seeing
 * the blocked user's posts/profile, and the blocked user stops seeing the
 * blocker's posts. We also notify the moderation inbox so the developer can
 * review the offending content (especially when `reportedCompletionId` is set).
 *
 * Side effects:
 *   - Removes any existing friendship in either direction.
 *   - Sends a best-effort email notification to the moderation inbox.
 *   - Returns the freshly-created Block row.
 */
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const blockerId = req.user.id;

  const body = req.body as {
    blockedUserId: number;
    reason?: string;
    reportedCompletionId?: number;
  };
  const blockedId = Number(body.blockedUserId);

  if (!Number.isInteger(blockedId) || blockedId < 1) {
    throw new AppError('Invalid blockedUserId', 400);
  }
  if (blockedId === blockerId) {
    throw new AppError('You cannot block yourself', 400);
  }

  const blockedUser = await prisma.user.findUnique({
    where: { id: blockedId },
    select: { id: true, name: true, email: true },
  });
  if (!blockedUser) {
    throw new AppError('User not found', 404);
  }

  let reportedCompletion: {
    id: number;
    caption: string | null;
    imageUrl: string | null;
    imageUri: string | null;
    challenge: { title: string };
  } | null = null;

  if (body.reportedCompletionId) {
    reportedCompletion = await prisma.challengeCompletion.findUnique({
      where: { id: Number(body.reportedCompletionId) },
      select: {
        id: true,
        caption: true,
        imageUrl: true,
        imageUri: true,
        challenge: { select: { title: true } },
      },
    });
  }

  const block = await prisma.$transaction(async (tx) => {
    const created = await tx.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: {
        blockerId,
        blockedId,
        reason: body.reason?.trim() || null,
        reportedCompletionId: reportedCompletion?.id ?? null,
      },
      update: {
        // Refresh metadata if the user blocks again with a different reason or
        // a fresh offending post; this lets the moderation email always carry
        // the latest context without producing duplicate Block rows.
        reason: body.reason?.trim() || null,
        reportedCompletionId: reportedCompletion?.id ?? null,
      },
    });

    // Tear down any existing friendship so the blocked user can't see private content.
    await tx.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: blockerId, addresseeId: blockedId },
          { requesterId: blockedId, addresseeId: blockerId },
        ],
      },
    });

    return created;
  });

  const actor = await prisma.user.findUnique({
    where: { id: blockerId },
    select: { id: true, email: true, name: true },
  });

  // Fire-and-forget moderation notification — never block the user response on email.
  sendModerationNotification({
    kind: 'block',
    actor: {
      id: blockerId,
      email: actor?.email ?? req.user.email,
      name: actor?.name ?? req.user.email,
    },
    target: {
      id: blockedUser.id,
      email: blockedUser.email,
      name: blockedUser.name,
    },
    reason: body.reason ?? null,
    completion: reportedCompletion
      ? {
          id: reportedCompletion.id,
          challengeTitle: reportedCompletion.challenge?.title ?? null,
          caption: reportedCompletion.caption,
          imageUrl: reportedCompletion.imageUrl ?? reportedCompletion.imageUri ?? null,
        }
      : null,
  }).catch((err) =>
    logger.error('Block notification email failed', { error: err, blockerId, blockedId }),
  );

  const response: ApiResponse<typeof block> = {
    success: true,
    data: block,
    message: 'User blocked. Their posts will no longer appear in your feed.',
  };
  res.status(201).json(response);
});

/**
 * DELETE /api/blocks/:blockedUserId
 * Lift a previously-issued block.
 */
export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const blockerId = req.user.id;
  const blockedId = parseInt(req.params.blockedUserId, 10);
  if (Number.isNaN(blockedId)) {
    throw new AppError('Invalid blockedUserId', 400);
  }

  const result = await prisma.block.deleteMany({
    where: { blockerId, blockedId },
  });
  if (result.count === 0) {
    throw new AppError('You have not blocked this user', 404);
  }

  res.json({ success: true, message: 'User unblocked' });
});

/**
 * GET /api/blocks
 * List the users that the signed-in user has blocked. Powers the
 * "blocked users" management screen in settings.
 */
export const listBlocks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const blockerId = req.user.id;

  const rows = await prisma.block.findMany({
    where: { blockerId },
    orderBy: { createdAt: 'desc' },
    include: {
      blocked: { select: { id: true, name: true } },
    },
  });

  const data = rows.map((r) => ({
    id: r.id,
    blockedUserId: r.blockedId,
    blockedUserName: r.blocked.name,
    reason: r.reason,
    reportedCompletionId: r.reportedCompletionId,
    createdAt: r.createdAt,
  }));

  const response: ApiResponse<typeof data> = { success: true, data };
  res.json(response);
});

