-- v4.82.0 workspace model hardening

ALTER TABLE "Wiki"
  ADD COLUMN IF NOT EXISTS "visibility" TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS "defaultRole" TEXT NOT NULL DEFAULT 'viewer',
  ADD COLUMN IF NOT EXISTS "navigationMode" TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS "bootstrapProfile" TEXT NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS "marketplaceSelections" JSONB;

ALTER TABLE "WikiMembership"
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS "invitedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "WorkspaceInvitation" (
  "id" TEXT NOT NULL,
  "wikiId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'viewer',
  "token" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "invitedById" TEXT,
  "acceptedById" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkspaceInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceInvitation_token_key" ON "WorkspaceInvitation"("token");
CREATE INDEX IF NOT EXISTS "Wiki_visibility_idx" ON "Wiki"("visibility");
CREATE INDEX IF NOT EXISTS "Wiki_bootstrapProfile_idx" ON "Wiki"("bootstrapProfile");
CREATE INDEX IF NOT EXISTS "WikiMembership_role_idx" ON "WikiMembership"("role");
CREATE INDEX IF NOT EXISTS "WikiMembership_status_idx" ON "WikiMembership"("status");
CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_wikiId_idx" ON "WorkspaceInvitation"("wikiId");
CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_email_idx" ON "WorkspaceInvitation"("email");
CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_status_idx" ON "WorkspaceInvitation"("status");
CREATE INDEX IF NOT EXISTS "WorkspaceInvitation_expiresAt_idx" ON "WorkspaceInvitation"("expiresAt");

ALTER TABLE "WorkspaceInvitation"
  ADD CONSTRAINT "WorkspaceInvitation_wikiId_fkey"
  FOREIGN KEY ("wikiId") REFERENCES "Wiki"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceInvitation"
  ADD CONSTRAINT "WorkspaceInvitation_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkspaceInvitation"
  ADD CONSTRAINT "WorkspaceInvitation_acceptedById_fkey"
  FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

