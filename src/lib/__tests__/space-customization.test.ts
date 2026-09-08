import { describe, expect, it } from "vitest";
import {
  defaultGlobalSpaceCustomization,
  resolveSpaceCustomizationInheritance,
  spaceCustomizationContract,
  spaceCustomizationMigrationGuide,
  toPublicSpaceCustomization,
  validateSpaceCustomizationInput,
} from "../space-customization";

describe("space customization", () => {
  it("validates persisted override fields", () => {
    const result = validateSpaceCustomizationInput({
      colorThemeId: "forest",
      componentPackId: "docs-portal-components",
      layoutId: "docs-portal",
      metadataSchemaId: "docs.article",
      navigationMode: "section-cards",
      privateDraftConfig: { reviewerOnly: true },
      styleId: "atlas-modern",
      templatePackId: "docs-template-pack",
    });

    expect(result.valid).toBe(true);
    expect(result.values).toMatchObject({
      colorThemeId: "forest",
      componentPackId: "docs-portal-components",
      layoutId: "docs-portal",
      metadataSchemaId: "docs.article",
      navigationMode: "section-cards",
      styleId: "atlas-modern",
      templatePackId: "docs-template-pack",
    });
  });

  it("reports unsupported registry ids and private draft shapes", () => {
    const result = validateSpaceCustomizationInput({
      colorThemeId: "unknown",
      componentPackId: "unknown",
      layoutId: "unknown",
      navigationMode: "unknown",
      privateDraftConfig: ["draft"],
      styleId: "unknown",
      templatePackId: "../unsafe",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "unsupported styleId: unknown",
        "unsupported colorThemeId: unknown",
        "unsupported layoutId: unknown",
        "unsupported componentPackId: unknown",
        "unsupported navigationMode: unknown",
        "templatePackId must use lowercase kebab-case",
        "privateDraftConfig must be an object",
      ]),
    );
  });

  it("redacts private draft configuration from public shapes", () => {
    const publicShape = toPublicSpaceCustomization(
      {
        ...defaultGlobalSpaceCustomization(),
        privateDraftConfig: { adminOnly: "draft" },
      },
      "space",
      "docs",
    );

    expect(publicShape).not.toHaveProperty("privateDraftConfig");
    expect(publicShape.inheritedFrom).toBe("docs");
  });

  it("resolves global, parent, space, and article precedence", () => {
    const resolved = resolveSpaceCustomizationInheritance({
      articleOverride: {
        id: "article-1",
        componentPackId: "research-notebook-components",
      },
      categoryChain: [
        {
          id: "parent-space",
          colorThemeId: "forest",
          layoutId: "docs-portal",
        },
        {
          id: "child-space",
          styleId: "atlas-modern",
        },
      ],
      globalDefaults: defaultGlobalSpaceCustomization(),
    });

    expect(resolved.effective).toMatchObject({
      colorThemeId: "forest",
      componentPackId: "research-notebook-components",
      layoutId: "docs-portal",
      source: "article",
      styleId: "atlas-modern",
    });
    expect(resolved.sources.colorThemeId).toBe("parent-space");
    expect(resolved.sources.styleId).toBe("space");
    expect(resolved.sources.componentPackId).toBe("article");
    expect(resolved.privateDraftConfigHidden).toBe(true);
    expect(resolved.chain).toHaveLength(4);
  });

  it("documents the persisted v1 contract and rollback path", () => {
    expect(spaceCustomizationContract.status).toBe("persisted");
    expect(spaceCustomizationContract.precedence).toEqual(["global", "parent-space", "space", "article"]);
    expect(spaceCustomizationMigrationGuide.migrate).toContain("npx prisma db push");
    expect(spaceCustomizationMigrationGuide.rollback).toContain("ArticleCustomizationOverride");
  });
});
