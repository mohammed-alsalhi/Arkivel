import { describe, expect, it } from "vitest";
import {
  RELEASE_CANDIDATE_GATES,
  RELEASE_SYNC_FILES,
  createReleaseGateReport,
  releaseGateIsRequired,
} from "../release-gate-automation";

describe("release gate automation", () => {
  it("requires every release candidate gate", () => {
    const report = createReleaseGateReport("4.96.2");

    expect(report.contract.apiRoute).toBe("/api/release-gates");
    expect(report.gateMatrix.map((gate) => gate.gate)).toEqual(RELEASE_CANDIDATE_GATES);
    expect(report.gateMatrix.every((gate) => gate.requiredForReleaseCandidate)).toBe(true);
    expect(releaseGateIsRequired("docs-sync")).toBe(true);
  });

  it("publishes docs sync script and required files", () => {
    const report = createReleaseGateReport("4.96.2");

    expect(report.docsSync.script).toBe("scripts/verify-docs-sync.mjs");
    expect(report.docsSync.requiredFiles).toEqual(RELEASE_SYNC_FILES);
    expect(report.docsSync.verifies).toContain("in-app references");
  });

  it("generates release checklist metadata and blocker labels", () => {
    const report = createReleaseGateReport("4.96.2");

    expect(report.checklist.version).toBe("4.96.2");
    expect(report.checklist.labels).toContain("release-blocker");
    expect(report.checklist.labels).toContain("smoke-failure");
    expect(report.contract.knownIssues).toBe("docs/known-issues.md");
  });
});
