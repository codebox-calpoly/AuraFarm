-- CreateEnum
CREATE TYPE "ChallengeCategory" AS ENUM ('sports', 'outdoors', 'clubs', 'campus', 'beach', 'volunteering', 'arts_culture');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN "category" "ChallengeCategory" NOT NULL DEFAULT 'campus';

-- CreateIndex
CREATE INDEX "Challenge_category_idx" ON "Challenge"("category");
