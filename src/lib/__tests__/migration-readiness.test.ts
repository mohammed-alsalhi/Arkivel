import { describe, expect, it } from "vitest";
import {
  MIGRATION_DRY_RUN_PHASES,
  createMigrationReadinessReport,
  createSchemaCompatibilityReport,
  migrationCoverageIncludes,
} from "../migration-readiness";

describe("migration readiness", () => {
  it("publishes every blocking dry-run and recovery phase", () => {
    const report = createMigrationReadinessReport();

    expect(report.contract.apiRoute).toBe("/api/migration-readiness");
    expect(report.dryRunPlan.map((phase) => phase.id)).toEqual(MIGRATION_DRY_RUN_PHASES.map((phase) => phase.id));
    expect(report.dryRunPlan.every((phase) => phase.blocking)).toBe(true);
    expect(report.dryRunPlan.map((phase) => phase.id)).toEqual([
      "backup-prompt",
      "schema-compatibility",
      "data-integrity",
      "restore-validation",
      "failure-recovery",
    ]);
  });

  it("covers representative v4 upgrade paths to the latest beta", () => {
    const report = createMigrationReadinessReport();

    expect(report.upgradePaths.map((path) => path.id)).toEqual([
      "personal-wiki-v4-80",
      "team-workspace-v4-82",
      "public-docs-v4-86",
      "marketplace-heavy-v4-90",
      "plugin-enabled-v4-92",
    ]);
    expect(report.upgradePaths.every((path) => path.target === "latest v4 beta")).toBe(true);
  });

  it("requires admin-visible schema compatibility reports before v5", () => {
    const report = createSchemaCompatibilityReport();

    expect(report.releaseGate.status).toBe("required-before-v5");
    expect(report.releaseGate.requiresAdminOperationsVisibility).toBe(true);
    expect(report.surfaces).toContain("prisma");
    expect(report.decisions.some((decision) => decision.breaking)).toBe(true);
  });

  it("keeps migration tests focused on customization, marketplace, plugins, spaces, and templates", () => {
    const report = createMigrationReadinessReport();

    expect(report.testMatrix.map((item) => item.surface)).toEqual(["customization", "marketplace", "plugins", "spaces", "templates"]);
    expect(report.testMatrix.every((item) => item.dryRunRequired && item.restoreValidationRequired)).toBe(true);
    expect(migrationCoverageIncludes("marketplace")).toBe(true);
    expect(migrationCoverageIncludes("comments")).toBe(false);
  });
});
