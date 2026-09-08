-- v4.83.2 moderation and suggestions

ALTER TABLE "Discussion"
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'visible',
  ADD COLUMN IF NOT EXISTS "visibility" TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS "reportCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "reportReason" TEXT,
  ADD COLUMN IF NOT EXISTS "reportedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "moderationReason" TEXT,
  ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "moderatedById" TEXT;

CREATE INDEX IF NOT EXISTS "Discussion_status_idx" ON "Discussion"("status");
CREATE INDEX IF NOT EXISTS "Discussion_visibility_idx" ON "Discussion"("visibility");

ALTER TABLE "EditSuggestion"
  ADD COLUMN IF NOT EXISTS "assigneeId" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewerComment" TEXT,
  ADD COLUMN IF NOT EXISTS "convertedTaskUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL DEFAULT 'edit-suggestion',
  ADD COLUMN IF NOT EXISTS "spamScore" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "moderationState" TEXT NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

CREATE INDEX IF NOT EXISTS "EditSuggestion_assigneeId_idx" ON "EditSuggestion"("assigneeId");
CREATE INDEX IF NOT EXISTS "EditSuggestion_moderationState_idx" ON "EditSuggestion"("moderationState");
