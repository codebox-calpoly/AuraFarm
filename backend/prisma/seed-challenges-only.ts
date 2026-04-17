/**
 * Replace all challenges with CHALLENGE_SEED_DATA without deleting users.
 * Removes completions and flags first (FK order), then challenges, then inserts.
 * Run: npm run seed:challenges
 */
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '../.env') });
config({ path: path.resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import { CHALLENGE_SEED_DATA } from './challengeSeedData';
import { CHALLENGE_TAGS_BY_TITLE } from './challengeTagsByTitle';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Seeding challenges only (users are kept)...');

  await prisma.flag.deleteMany();
  await prisma.challengeCompletion.deleteMany();
  await prisma.challenge.deleteMany();

  for (const c of CHALLENGE_SEED_DATA) {
    const tags = CHALLENGE_TAGS_BY_TITLE[c.title];
    if (!tags?.length) {
      throw new Error(`Missing tags mapping for challenge title: ${c.title}`);
    }
    await prisma.challenge.create({
      data: {
        title: c.title,
        description: c.description,
        photoGuidelines: c.photoGuidelines.map((s) => s.trim()).join('\n'),
        latitude: c.latitude,
        longitude: c.longitude,
        difficulty: c.difficulty,
        pointsReward: c.pointsReward,
        tags,
      },
    });
  }

  console.log(`✅ Inserted ${CHALLENGE_SEED_DATA.length} challenges`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
