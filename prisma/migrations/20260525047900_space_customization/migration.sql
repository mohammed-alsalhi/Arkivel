-- CreateTable
CREATE TABLE "SpaceCustomization" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "styleId" TEXT,
    "colorThemeId" TEXT,
    "layoutId" TEXT,
    "componentPackId" TEXT,
    "templatePackId" TEXT,
    "navigationMode" TEXT,
    "metadataSchemaId" TEXT,
    "privateDraftConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCustomizationOverride" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "styleId" TEXT,
    "colorThemeId" TEXT,
    "layoutId" TEXT,
    "componentPackId" TEXT,
    "templatePackId" TEXT,
    "navigationMode" TEXT,
    "metadataSchemaId" TEXT,
    "privateDraftConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleCustomizationOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpaceCustomization_categoryId_key" ON "SpaceCustomization"("categoryId");

-- CreateIndex
CREATE INDEX "SpaceCustomization_categoryId_idx" ON "SpaceCustomization"("categoryId");

-- CreateIndex
CREATE INDEX "SpaceCustomization_layoutId_idx" ON "SpaceCustomization"("layoutId");

-- CreateIndex
CREATE INDEX "SpaceCustomization_componentPackId_idx" ON "SpaceCustomization"("componentPackId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCustomizationOverride_articleId_key" ON "ArticleCustomizationOverride"("articleId");

-- CreateIndex
CREATE INDEX "ArticleCustomizationOverride_articleId_idx" ON "ArticleCustomizationOverride"("articleId");

-- CreateIndex
CREATE INDEX "ArticleCustomizationOverride_layoutId_idx" ON "ArticleCustomizationOverride"("layoutId");

-- CreateIndex
CREATE INDEX "ArticleCustomizationOverride_componentPackId_idx" ON "ArticleCustomizationOverride"("componentPackId");

-- AddForeignKey
ALTER TABLE "SpaceCustomization" ADD CONSTRAINT "SpaceCustomization_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCustomizationOverride" ADD CONSTRAINT "ArticleCustomizationOverride_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
