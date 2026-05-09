import { prisma } from '../prisma';

/**
 * Returns the union of user IDs that the viewer has blocked AND user IDs that
 * have blocked the viewer. Posts/profiles for any of these IDs must be hidden
 * from the viewer's feed, search, leaderboard, and direct profile views.
 *
 * Returns an empty array for unauthenticated viewers.
 */
export async function getBlockedAndBlockerIds(userId: number | undefined): Promise<number[]> {
  if (!userId) return [];
  const rows = await prisma.block.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<number>();
  for (const r of rows) {
    if (r.blockerId !== userId) ids.add(r.blockerId);
    if (r.blockedId !== userId) ids.add(r.blockedId);
  }
  return Array.from(ids);
}

/**
 * Returns just the IDs the viewer has actively blocked (one-directional).
 * Used for the "manage blocked users" list in settings.
 */
export async function getBlockedIdsBy(userId: number): Promise<number[]> {
  const rows = await prisma.block.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });
  return rows.map((r) => r.blockedId);
}
