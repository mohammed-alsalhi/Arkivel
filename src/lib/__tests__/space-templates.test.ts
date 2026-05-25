import { describe, expect, it } from "vitest";
import {
  SPACE_TEMPLATE_SCHEMA_VERSION,
  builtInSpaceTemplates,
  createStarterSpaceImportPreview,
  createStarterSpacePreviewPages,
  exportSpaceTemplate,
  importSpaceTemplateJson,
  previewSpaceTemplate,
  spaceTemplateContract,
  validateSpaceTemplate,
} from "../space-templates";

describe("space templates", () => {
  it("publishes the v4.79.2 built-in template set", () => {
    expect(builtInSpaceTemplates.map((template) => template.id)).toEqual([
      "personal-wiki",
      "team-handbook",
      "product-docs",
      "worldbuilding-bible",
      "research-notebook",
      "reading-archive",
      "project-knowledge-base",
      "public-documentation",
    ]);
    expect(builtInSpaceTemplates.every((template) => validateSpaceTemplate(template).valid)).toBe(true);
  });

  it("previews a template before any apply flow exists", () => {
    const preview = previewSpaceTemplate(builtInSpaceTemplates[2]);

    expect(preview).toMatchObject({
      articleTemplateCount: 4,
      categoryCount: 5,
      id: "product-docs",
      layoutId: "docs-portal",
      metadataFieldCount: 3,
      oneClickImportPreviewRoute: "/api/space-templates",
      previewRoute: "/space-templates/product-docs",
    });
    expect(preview.rootCategories).toEqual(["Docs", "Support"]);
    expect(preview.validation.valid).toBe(true);
  });

  it("round-trips export and import JSON with validation", () => {
    const exported = exportSpaceTemplate(builtInSpaceTemplates[0]);
    const imported = importSpaceTemplateJson(exported);

    expect(imported.template?.schemaVersion).toBe(SPACE_TEMPLATE_SCHEMA_VERSION);
    expect(imported.preview.validation.valid).toBe(true);
    expect(imported.preview.id).toBe("personal-wiki");
  });

  it("rejects unsupported schema versions, unsafe references, and unknown packs", () => {
    const result = validateSpaceTemplate({
      ...builtInSpaceTemplates[0],
      componentPackId: "unknown-pack",
      id: "../bad",
      schemaVersion: "old",
      templatePackId: "https://example.com/template",
    });
    const codes = result.issues.map((issue) => issue.code);

    expect(result.valid).toBe(false);
    expect(codes).toContain("unsupported-schema");
    expect(codes).toContain("invalid-id");
    expect(codes).toContain("unknown-component-pack");
    expect(codes).toContain("unsafe-reference");
  });

  it("documents the preview-only import/export contract", () => {
    expect(spaceTemplateContract.previewOnly).toBe(true);
    expect(spaceTemplateContract.requiredFields).toContain("categoryTree");
    expect(spaceTemplateContract.requiredFields).toContain("navigation");
    expect(spaceTemplateContract.requiredFields).toContain("dashboard");
    expect(spaceTemplateContract.requiredFields).toContain("recommendedPacks");
  });

  it("publishes preview pages and one-click local import previews", () => {
    const previewPages = createStarterSpacePreviewPages();
    const importPreview = createStarterSpaceImportPreview("public-documentation");

    expect(previewPages.map((page) => page.id)).toContain("public-documentation");
    expect(importPreview.found).toBe(true);
    expect(importPreview.preview?.id).toBe("public-documentation");
    expect(importPreview.oneClickLocalImport.enabled).toBe(true);
  });
});
