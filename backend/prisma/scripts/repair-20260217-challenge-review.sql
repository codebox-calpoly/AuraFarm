-- Idempotent repair when migration 20260217120000 failed mid-flight because
-- "ChallengeReviewStatus" already existed but the rest never ran (or re-run safely).

DO $$ BEGIN
  CREATE TYPE "ChallengeReviewStatus" AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ChallengeCompletion" ADD COLUMN IF NOT EXISTS "reviewStatus" "ChallengeReviewStatus" NOT NULL DEFAULT 'approved';
ALTER TABLE "ChallengeCompletion" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "ChallengeCompletion" ADD COLUMN IF NOT EXISTS "postedAt" TIMESTAMP(3);

UPDATE "ChallengeCompletion"
SET "reviewedAt" = "completedAt",
    "postedAt" = "completedAt"
WHERE "reviewedAt" IS NULL;

ALTER TABLE "ChallengeCompletion" ALTER COLUMN "reviewStatus" SET DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS "ChallengeCompletion_reviewStatus_completedAt_idx" ON "ChallengeCompletion"("reviewStatus", "completedAt");
