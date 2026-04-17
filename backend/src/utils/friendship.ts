import { prisma } from '../prisma';
import { FriendshipStatus } from '@prisma/client';

export async function getAcceptedFriendIds(userId: number): Promise<number[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.accepted,
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}
