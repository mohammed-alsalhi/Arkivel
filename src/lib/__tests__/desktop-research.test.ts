import { describe, expect, it } from "vitest";
import { createDesktopResearchReport, desktopDecisionRecord } from "../desktop-research";

describe("desktop research", () => {
  it("publishes packaging options without committing v5 scope", () => {
    const report = createDesktopResearchReport();

    expect(report.contract.apiRoute).toBe("/api/desktop-research");
    expect(report.contract.packagingOptions).toEqual(["electron", "tauri", "browser-pwa", "docker-desktop"]);
    expect(report.contract.v5Scope).toBe("research-only");
  });

  it("covers local deployment and filesystem import/export planning", () => {
    const report = createDesktopResearchReport();

    expect(report.localDeploymentRecipes).toContain("docker-desktop-single-machine");
    expect(report.fileSystemUxPlan.imports).toContain("run dry-run conflict report");
    expect(report.fileSystemUxPlan.exports).toContain("write manifest and checksums");
  });

  it("records the desktop decision checkpoint", () => {
    expect(desktopDecisionRecord.decision).toContain("Do not commit desktop packaging");
    expect(desktopDecisionRecord.requiredEvidence).toContain("plugin safety boundary");
  });
});
