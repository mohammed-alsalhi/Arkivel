CREATE TABLE "ExportHistory" (
    "id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL,
    "manifest" JSONB NOT NULL DEFAULT '{}',
    "warnings" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "omittedData" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "byteCount" INTEGER NOT NULL DEFAULT 0,
    "checksum" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExportHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExportHistory_createdAt_idx" ON "ExportHistory"("createdAt");
CREATE INDEX "ExportHistory_format_idx" ON "ExportHistory"("format");
CREATE INDEX "ExportHistory_status_idx" ON "ExportHistory"("status");
CREATE INDEX "ExportHistory_userId_idx" ON "ExportHistory"("userId");
