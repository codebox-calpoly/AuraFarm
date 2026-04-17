-- AlterEnum: add misc
ALTER TYPE "ChallengeCategory" ADD VALUE IF NOT EXISTS 'misc';

-- Add tags array; backfill from legacy category column then drop it.
ALTER TABLE "Challenge" ADD COLUMN "tags" "ChallengeCategory"[] DEFAULT ARRAY[]::"ChallengeCategory"[];

UPDATE "Challenge" SET "tags" = ARRAY["category"]::"ChallengeCategory"[] WHERE "tags" = '{}';

ALTER TABLE "Challenge" ALTER COLUMN "tags" SET NOT NULL;

DROP INDEX IF EXISTS "Challenge_category_idx";

ALTER TABLE "Challenge" DROP COLUMN "category";

CREATE INDEX "Challenge_tags_idx" ON "Challenge" USING GIN ("tags");
