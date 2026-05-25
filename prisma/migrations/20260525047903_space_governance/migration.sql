-- CreateTable
CREATE TABLE "SpaceGovernance" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "ownerId" TEXT,
    "ownerLabel" TEXT,
    "reviewerId" TEXT,
    "reviewerLabel" TEXT,
    "defaultVisibility" TEXT,
    "reviewCadenceDays" INTEGER,
    "healthStaleDays" INTEGER,
    "healthRequiredSignals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceGovernance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpaceGovernance_categoryId_key" ON "SpaceGovernance"("categoryId");

-- CreateIndex
CREATE INDEX "SpaceGovernance_categoryId_idx" ON "SpaceGovernance"("categoryId");

-- CreateIndex
CREATE INDEX "SpaceGovernance_ownerId_idx" ON "SpaceGovernance"("ownerId");

-- CreateIndex
CREATE INDEX "SpaceGovernance_reviewerId_idx" ON "SpaceGovernance"("reviewerId");

-- CreateIndex
CREATE INDEX "SpaceGovernance_defaultVisibility_idx" ON "SpaceGovernance"("defaultVisibility");

-- AddForeignKey
ALTER TABLE "SpaceGovernance" ADD CONSTRAINT "SpaceGovernance_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
