/*
  Warnings:

  - Added the required column `imageUri` to the `ChallengeCompletion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChallengeCompletion" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "imageUri" TEXT NOT NULL,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;
