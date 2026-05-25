import { describe, expect, it } from "vitest";
import {
  UPGRADE_READINESS_CHECKS,
  createCompatibilityWarnings,
  createUpgradeAssistantReport,
  hasBlockingCompatibilityWarning,
} from "../upgrade-assistant";

describe("upgrade assistant", () => {
  it("publishes the v5 upgrade readiness checklist", () => {
    const report = createUpgradeAssistantReport();

    expect(report.contract.apiRoute).toBe("/api/upgrade-assistant");
    expect(report.readinessChecklist.map((check) => check.id)).toEqual(UPGRADE_READINESS_CHECKS);
    expect(report.readinessChecklist.every((check) => check.required)).toBe(true);
  });

  it("includes pre-upgrade diagnostics and post-upgrade smoke checks", () => {
    const report = createUpgradeAssistantReport();

    expect(report.diagnosticsPlan.preUpgradeDiagnostics.map((check) => check.id)).toContain("pending-migrations");
    expect(report.diagnosticsPlan.preUpgradeDiagnostics.map((check) => check.id)).toContain("restore-rehearsal");
    expect(report.diagnosticsPlan.postUpgradeSmokeChecks.map((check) => check.id)).toContain("article-render");
    expect(report.diagnosticsPlan.postUpgradeSmokeChecks.map((check) => check.id)).toContain("backup-restore-report");
  });

  it("reports compatibility warnings for env vars, APIs, plugin permissions, and pack schemas", () => {
    const warnings = createCompatibilityWarnings({
      deprecatedApis: ["/api/v0/articles"],
      deprecatedEnvVars: ["ARKIVEL_OLD_THEME"],
      packSchemaVersions: ["component-pack@0"],
      pluginPermissions: ["file:read"],
    });

    expect(warnings.map((warning) => warning.type)).toEqual([
      "deprecated-env-var",
      "deprecated-api",
      "plugin-permission",
      "pack-schema-version",
    ]);
    expect(hasBlockingCompatibilityWarning(warnings)).toBe(true);
  });

  it("exposes release notes, migration docs, and v5 planning guidance", () => {
    const report = createUpgradeAssistantReport();

    expect(report.contract.links.changelog).toBe("CHANGELOG.md");
    expect(report.contract.links.migrationReadiness).toBe("docs/migration-readiness.md");
    expect(report.inAppLinks.map((link) => link.href)).toContain("/api-docs");
    expect(report.v5PlanningGuide.join(" ")).toContain("post-upgrade smoke checks");
  });
});
