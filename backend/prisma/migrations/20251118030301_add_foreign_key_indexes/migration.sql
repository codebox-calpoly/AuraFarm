-- CreateIndex
CREATE INDEX "ChallengeCompletion_userId_idx" ON "ChallengeCompletion"("userId");

-- CreateIndex
CREATE INDEX "ChallengeCompletion_challengeId_idx" ON "ChallengeCompletion"("challengeId");

-- CreateIndex
CREATE INDEX "Flag_completionId_idx" ON "Flag"("completionId");

-- CreateIndex
CREATE INDEX "Flag_flaggedById_idx" ON "Flag"("flaggedById");
