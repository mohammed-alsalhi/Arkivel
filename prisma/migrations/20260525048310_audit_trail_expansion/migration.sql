-- v4.83.1 audit trail expansion

ALTER TABLE "AuditLog"
  ADD COLUMN IF NOT EXISTS "workspaceId" TEXT,
  ADD COLUMN IF NOT EXISTS "severity" TEXT NOT NULL DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS "actorType" TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
  ADD COLUMN IF NOT EXISTS "success" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "AuditLog_workspaceId_idx" ON "AuditLog"("workspaceId");
CREATE INDEX IF NOT EXISTS "AuditLog_severity_idx" ON "AuditLog"("severity");
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_idx" ON "AuditLog"("entityType");
CREATE INDEX IF NOT EXISTS "AuditLog_success_idx" ON "AuditLog"("success");
