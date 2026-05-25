import { describe, expect, it } from "vitest";
import {
  IMPORT_CONFLICT_CATEGORIES,
  IMPORT_RECOMMENDED_ACTIONS,
  createImportDryRunPreview,
  createImportRehearsalPlan,
  importRehearsalContract,
  importRehearsalFixtures,
} from "../import-rehearsal";

describe("import rehearsal", () => {
  it("defines dry-run conflict categories and recommended actions", () => {
    expect(IMPORT_CONFLICT_CATEGORIES).toEqual([
      "duplicate-slugs",
      "category-conflicts",
      "tag-conflicts",
      "user-mapping",
      "asset-mapping",
      "revision-preservation",
      "unsupported-schema",
      "permission-gaps",
    ]);
    expect(IMPORT_RECOMMENDED_ACTIONS).toEqual(expect.arrayContaining([
      "rename-slug",
      "merge-category",
      "merge-tag",
      "map-user",
      "map-asset",
      "preserve-revisions",
      "block-import",
    ]));
  });

  it("creates rollback plans before writes are allowed", () => {
    const plan = createImportRehearsalPlan({
      blockedChanges: ["API keys cannot be imported."],
      rollbackPlan: [{ action: "delete-created", target: "article:example" }],
    });

    expect(plan.writeAllowed).toBe(false);
    expect(plan.blockedChanges).toEqual(["API keys cannot be imported."]);
    expect(plan.rollbackPlan).toEqual([{ action: "delete-created", target: "article:example" }]);
  });

  it("ships fixture coverage for small wiki, large archive, docs portal, and worldbuilding atlas", () => {
    expect(importRehearsalFixtures.map((fixture) => fixture.id)).toEqual([
      "small-wiki",
      "large-archive",
      "docs-portal",
      "worldbuilding-atlas",
    ]);
    expect(importRehearsalContract.dryRunOnly).toBe(true);
  });

  it("wraps the portable dry-run report shape", () => {
    const preview = createImportDryRunPreview({ blockedChanges: ["Unsupported schema."] });

    expect(preview.dryRunReport.blockedChanges[0]).toMatchObject({
      code: "blocked-change",
      severity: "blocked",
    });
    expect(preview.plan.writeAllowed).toBe(false);
  });
});
