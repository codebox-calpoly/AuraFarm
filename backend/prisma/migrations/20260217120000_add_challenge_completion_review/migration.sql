-- CreateEnum
CREATE TYPE "ChallengeReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable: existing completions were already public — treat as approved with timestamps.
ALTER TABLE "ChallengeCompletion" ADD COLUMN "reviewStatus" "ChallengeReviewStatus" NOT NULL DEFAULT 'approved';
ALTER TABLE "ChallengeCompletion" ADD COLUMN "reviewedAt" TIMESTAMP(3);
ALTER TABLE "ChallengeCompletion" ADD COLUMN "postedAt" TIMESTAMP(3);

UPDATE "ChallengeCompletion"
SET "reviewedAt" = "completedAt",
    "postedAt" = "completedAt"
WHERE "reviewedAt" IS NULL;

-- New submissions default to pending; existing rows retain approved.
ALTER TABLE "ChallengeCompletion" ALTER COLUMN "reviewStatus" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "ChallengeCompletion_reviewStatus_completedAt_idx" ON "ChallengeCompletion"("reviewStatus", "completedAt");
