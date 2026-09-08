import { describe, expect, it } from "vitest";
import packageJson from "../../../package.json";
import {
  PORTABLE_BUNDLE_EXCLUDED_SECTIONS,
  PORTABLE_BUNDLE_PRIVACY_FILTERS,
  PORTABLE_BUNDLE_SCHEMA_VERSION,
  PORTABLE_BUNDLE_SECTIONS,
  createPortableBundleManifest,
  createPortableImportDryRunReport,
  portableBundleCompatibilityPromise,
  portableBundleContract,
} from "../portable-bundle";

describe("portable bundle contract", () => {
  it("covers the full-site export sections and explicit exclusions", () => {
    expect(PORTABLE_BUNDLE_SECTIONS).toEqual([
      "articles",
      "revisions",
      "categories",
      "tags",
      "users",
      "settings",
      "pluginState",
      "maps",
      "comments",
      "discussions",
      "assets",
      "customizations",
    ]);
    expect(PORTABLE_BUNDLE_EXCLUDED_SECTIONS).toEqual(["sessions", "apiKeys", "analytics"]);
  });

  it("creates manifests with version, source, scope, createdAt, and checksums", () => {
    const manifest = createPortableBundleManifest({
      checksums: {
        files: { "articles/index.json": "abc123" },
        manifest: "manifest123",
      },
      createdAt: "2026-05-25T00:00:00.000Z",
      source: {
        baseUrl: "https://example.test",
        instanceId: "wiki-1",
        name: "Example Wiki",
      },
    });

    expect(manifest).toMatchObject({
      appVersion: packageJson.version,
      checksums: {
        algorithm: "sha256",
        files: { "articles/index.json": "abc123" },
        manifest: "manifest123",
      },
      createdAt: "2026-05-25T00:00:00.000Z",
      schemaVersion: PORTABLE_BUNDLE_SCHEMA_VERSION,
    });
    expect(manifest.exportScope.included).toEqual([...PORTABLE_BUNDLE_SECTIONS]);
    expect(manifest.exportScope.excluded).toEqual([...PORTABLE_BUNDLE_EXCLUDED_SECTIONS]);
  });

  it("declares privacy filters for private spaces, drafts, users, analytics, and API keys", () => {
    expect(PORTABLE_BUNDLE_PRIVACY_FILTERS).toEqual([
      "privateSpaces",
      "draftContent",
      "users",
      "analytics",
      "apiKeys",
    ]);
    expect(portableBundleContract.exportScope.privacyFilters).toEqual(PORTABLE_BUNDLE_PRIVACY_FILTERS);
  });

  it("defines dry-run import reports for conflicts, missing assets, unsupported schemas, duplicate slugs, and permission gaps", () => {
    const report = createPortableImportDryRunReport({
      conflicts: [
        { code: "duplicate-slug", message: "Slug already exists.", severity: "blocked", type: "duplicate-slug" },
        { code: "unsupported-schema", message: "Schema is too new.", severity: "blocked", type: "unsupported-schema" },
      ],
      missingAssets: [
        { code: "missing-asset", message: "Asset file is missing.", path: "assets/a.png", severity: "warning", type: "missing-asset" },
      ],
      permissionGaps: [
        { code: "permission-gap", message: "Import needs admin access.", severity: "blocked", type: "permission-gap" },
      ],
    });

    expect(report.conflicts.map((item) => item.type)).toEqual(["duplicate-slug", "unsupported-schema"]);
    expect(report.missingAssets[0].type).toBe("missing-asset");
    expect(report.permissionGaps[0].type).toBe("permission-gap");
    expect(portableBundleContract.dryRunReport.requiredGroups).toEqual([
      "conflicts",
      "missingAssets",
      "permissionGaps",
      "blockedChanges",
      "recommendedActions",
    ]);
  });

  it("documents compatibility promises before v5", () => {
    expect(portableBundleCompatibilityPromise.stableTarget).toBe("v5.0.0");
    expect(portableBundleCompatibilityPromise.beforeV5).toEqual(expect.arrayContaining([
      expect.stringContaining("dry-run"),
      expect.stringContaining("Sessions"),
      expect.stringContaining("Privacy filters"),
    ]));
  });
});
