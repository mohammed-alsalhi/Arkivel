-- v4.83.0 editorial governance

ALTER TABLE "Article"
  ADD COLUMN IF NOT EXISTS "lastVerifiedById" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationEvidence" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationExpiresAt" TIMESTAMP(3);

ALTER TABLE "ReviewRequest"
  ADD COLUMN IF NOT EXISTS "dueAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "requiredReviewerIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "approvalThreshold" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "cycleCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "decisionNote" TEXT;

ALTER TABLE "ClaimReview"
  ADD COLUMN IF NOT EXISTS "evidence" TEXT,
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ClaimReview_expiresAt_idx" ON "ClaimReview"("expiresAt");

