ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseId_key" ON "User"("supabaseId");
CREATE INDEX IF NOT EXISTS "Challenge_latitude_longitude_idx" ON "Challenge"("latitude", "longitude");

CREATE TABLE IF NOT EXISTS "CompletionLike" (
    "id" SERIAL NOT NULL,
    "completionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletionLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CompletionLike_completionId_userId_key" ON "CompletionLike"("completionId", "userId");
CREATE INDEX IF NOT EXISTS "CompletionLike_completionId_idx" ON "CompletionLike"("completionId");
CREATE INDEX IF NOT EXISTS "CompletionLike_userId_idx" ON "CompletionLike"("userId");

DO $$ BEGIN
    ALTER TABLE "CompletionLike"
    ADD CONSTRAINT "CompletionLike_completionId_fkey"
    FOREIGN KEY ("completionId") REFERENCES "ChallengeCompletion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CompletionLike"
    ADD CONSTRAINT "CompletionLike_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
