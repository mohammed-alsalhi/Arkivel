import { describe, expect, it } from "vitest";
import {
  CI_MATRIX_DIMENSIONS,
  STABLE_QA_FIXTURES,
  TEST_EXPANSION_SURFACES,
  createTestQualityReport,
  warningRequiresKnownIssue,
} from "../test-quality-gates";

describe("test quality gates", () => {
  it("covers every planned test expansion surface", () => {
    const report = createTestQualityReport();

    expect(report.contract.apiRoute).toBe("/api/test-quality");
    expect(report.testExpansionMatrix.map((item) => item.surface)).toEqual(TEST_EXPANSION_SURFACES);
    expect(report.testExpansionMatrix.every((item) => item.requiredForV5)).toBe(true);
  });

  it("publishes stable QA fixture planning", () => {
    const report = createTestQualityReport();

    expect(report.fixturePlan.map((item) => item.fixture)).toEqual(STABLE_QA_FIXTURES);
    expect(report.fixturePlan.every((item) => item.reusableInCi && item.seedRequired)).toBe(true);
  });

  it("defines CI matrix dimensions for Node, database modes, and feature flags", () => {
    const report = createTestQualityReport();

    expect(report.ciMatrix).toEqual(CI_MATRIX_DIMENSIONS);
    expect(report.ciMatrix.nodeVersions).toContain("22");
    expect(report.ciMatrix.databaseModes).toContain("restore-rehearsal");
    expect(report.ciMatrix.featureFlags).toContain("trusted-plugins");
  });

  it("tracks known warnings and release-manager dashboard planning", () => {
    const report = createTestQualityReport();

    expect(report.warningPolicy.map((item) => item.id)).toContain("v5-acceptable-risk");
    expect(warningRequiresKnownIssue(true)).toBe(true);
    expect(warningRequiresKnownIssue(false)).toBe(false);
    expect(report.dashboardPlan.sections).toContain("release-blockers");
  });
});
