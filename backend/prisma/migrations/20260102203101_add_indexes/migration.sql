-- CreateIndex
CREATE INDEX "Challenge_createdAt_idx" ON "Challenge"("createdAt");

-- CreateIndex
CREATE INDEX "ChallengeCompletion_completedAt_idx" ON "ChallengeCompletion"("completedAt");

-- CreateIndex
CREATE INDEX  "ChallengeCompletion_userId_completedAt_idx" ON "ChallengeCompletion"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "User_auraPoints_idx" ON "User"("auraPoints");
