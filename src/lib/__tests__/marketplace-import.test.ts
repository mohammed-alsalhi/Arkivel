import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MARKETPLACE_IMPORT_SCHEMA_VERSION,
  SUPPORTED_MARKETPLACE_IMPORT_KINDS,
  createMarketplaceImportPreview,
  marketplaceImportExamples,
} from "../marketplace-import";

describe("marketplace import preview", () => {
  it("accepts preview examples for every supported import kind", () => {
    expect(SUPPORTED_MARKETPLACE_IMPORT_KINDS).toEqual([
      "theme-pack",
      "layout-pack",
      "component-pack",
      "plugin",
      "template-pack",
    ]);

    for (const kind of SUPPORTED_MARKETPLACE_IMPORT_KINDS) {
      const preview = createMarketplaceImportPreview(marketplaceImportExamples[kind]);

      expect(preview.valid).toBe(true);
      expect(preview.previewOnly).toBe(true);
      expect(preview.metadata.kind).toBe(kind);
      expect(preview.requiredFiles.length).toBeGreaterThan(0);
    }
  });

  it("parses pasted JSON import previews", () => {
    const preview = createMarketplaceImportPreview(JSON.stringify(marketplaceImportExamples["theme-pack"]));

    expect(preview.parsed).toBe(true);
    expect(preview.valid).toBe(true);
    expect(preview.metadata.id).toBe("example-aurora-theme");
  });

  it("surfaces declared slots for layout and component packs", () => {
    expect(createMarketplaceImportPreview(marketplaceImportExamples["layout-pack"]).slots).toContain("right-rail");
    expect(createMarketplaceImportPreview(marketplaceImportExamples["component-pack"]).slots).toContain("article-card");
  });

  it("shows theme token diffs against built-in tokens", () => {
    const preview = createMarketplaceImportPreview({
      ...marketplaceImportExamples["theme-pack"],
      tokens: {
        "--color-accent": "#111111",
        "--color-new": "#222222",
      },
    });

    expect(preview.tokenDiff.some((row) => row.token === "--color-accent" && row.status === "changed")).toBe(true);
    expect(preview.tokenDiff.some((row) => row.token === "--color-new" && row.status === "added")).toBe(true);
    expect(preview.tokenDiff.some((row) => row.token === "--color-background" && row.status === "removed")).toBe(true);
  });

  it("reports compatibility warnings without installing anything", () => {
    const preview = createMarketplaceImportPreview({
      ...marketplaceImportExamples["layout-pack"],
      compatibility: ">=99.0.0",
    });

    expect(preview.valid).toBe(true);
    expect(preview.status).toBe("accepted-preview");
    expect(preview.compatibilityWarnings[0]).toContain("does not match Arkivel");
  });

  it("rejects unsupported schema versions and unsupported kinds", () => {
    const preview = createMarketplaceImportPreview({
      ...marketplaceImportExamples["theme-pack"],
      kind: "unknown-pack",
      schemaVersion: "arkivel.marketplace.import.v0",
    });

    expect(preview.valid).toBe(false);
    expect(preview.validationErrors).toContain("unsupported schema version: arkivel.marketplace.import.v0");
    expect(preview.validationErrors).toContain("unsupported import kind: unknown-pack");
  });

  it("rejects executable payloads, remote code references, path traversal, and unsafe permissions", () => {
    const preview = createMarketplaceImportPreview({
      ...marketplaceImportExamples.plugin,
      permissions: ["system:execute"],
      postinstall: "node install.js",
      requiredFiles: ["plugin.json", "../outside.js"],
      remote: true,
      source: "https://example.com/plugin.js",
    });

    expect(preview.valid).toBe(false);
    expect(preview.securityErrors.some((error) => error.includes("executable field"))).toBe(true);
    expect(preview.securityErrors.some((error) => error.includes("remote reference"))).toBe(true);
    expect(preview.securityErrors.some((error) => error.includes("remote source"))).toBe(true);
    expect(preview.securityErrors.some((error) => error.includes("path traversal"))).toBe(true);
    expect(preview.securityErrors.some((error) => error.includes("unsafe permission"))).toBe(true);
  });

  it("rejects unsafe hooks and excessive permissions while surfacing dangerous capability warnings", () => {
    const preview = createMarketplaceImportPreview({
      ...marketplaceImportExamples.plugin,
      hooks: ["article.beforeCreate", "shell.afterInstall"],
      permissions: ["article:read", "article:write", "category:read", "settings:write", "webhook:send", "file:read"],
    });

    expect(preview.valid).toBe(false);
    expect(preview.securityErrors.some((error) => error.includes("unsafe hook"))).toBe(true);
    expect(preview.securityErrors.some((error) => error.includes("excessive permissions"))).toBe(true);
    expect(preview.securityWarnings.join(" ")).toContain("local files");
  });

  it("blocks malformed JSON", () => {
    const preview = createMarketplaceImportPreview("{bad");

    expect(preview.valid).toBe(false);
    expect(preview.parsed).toBe(false);
    expect(preview.validationErrors).toEqual(["Import JSON could not be parsed."]);
  });

  it("requires the current import schema in examples", () => {
    for (const kind of SUPPORTED_MARKETPLACE_IMPORT_KINDS) {
      expect(marketplaceImportExamples[kind].schemaVersion).toBe(MARKETPLACE_IMPORT_SCHEMA_VERSION);
    }
  });

  it("accepts sample marketplace contribution manifests", () => {
    const samplePaths = [
      "examples/marketplace/theme-pack/manifest.json",
      "examples/marketplace/component-pack/manifest.json",
      "examples/marketplace/plugin-manifest/manifest.json",
    ];

    for (const samplePath of samplePaths) {
      const source = readFileSync(join(process.cwd(), samplePath), "utf8");
      const preview = createMarketplaceImportPreview(source);

      expect(preview.valid).toBe(true);
      expect(preview.previewOnly).toBe(true);
    }
  });
});
