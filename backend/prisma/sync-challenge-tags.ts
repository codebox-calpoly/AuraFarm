/**
 * Updates `tags` on existing Challenge rows to match CHALLENGE_TAGS_BY_TITLE (by exact title).
 * Run from backend/: `npm run sync-challenge-tags`
 * Use after migrations or when tags in DB are stale (e.g. all `campus` from legacy backfill).
 */
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '../.env') });
config({ path: path.resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import { CHALLENGE_TAGS_BY_TITLE } from './challengeTagsByTitle';

const prisma = new PrismaClient();

async function main() {
  let updated = 0;
  let missing = 0;

  for (const [title, tags] of Object.entries(CHALLENGE_TAGS_BY_TITLE)) {
    const result = await prisma.challenge.updateMany({
      where: { title },
      data: { tags },
    });
    if (result.count === 0) {
      console.warn(`No row matched title: ${JSON.stringify(title)}`);
      missing += 1;
    } else {
      updated += result.count;
    }
  }

  console.log(`Updated ${updated} challenge row(s). ${missing} title(s) had no matching row (ok if DB not seeded yet).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
