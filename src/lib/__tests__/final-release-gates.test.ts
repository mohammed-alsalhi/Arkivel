import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  COMPATIBILITY_TARGETS,
  FINAL_BETA_FREEZE_CONTRACTS,
  FINAL_CORRECTION_WINDOWS,
  GATE_EVIDENCE_TYPES,
  RC_FIX_AREAS,
  STABLE_RELEASE_GATES,
  createFinalReleaseGatesReport,
  stableGateIsSatisfied,
} from "../final-release-gates";

const root = process.cwd();

function readText(file: string) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("final release gates", () => {
  it("publishes final release gate metadata", () => {
    const report = createFinalReleaseGatesReport();

    expect(report.contract.apiRoute).toBe("/api/final-release-gates");
    expect(report.rcFixAreas.map((item) => item.area)).toEqual(RC_FIX_AREAS);
    expect(report.finalBetaFreezeContracts.map((item) => item.contract)).toEqual(FINAL_BETA_FREEZE_CONTRACTS);
    expect(report.gateEvidence.map((item) => item.type)).toEqual(GATE_EVIDENCE_TYPES);
    expect(report.compatibilityTargets.map((item) => item.target)).toEqual(COMPATIBILITY_TARGETS);
    expect(report.correctionWindows.map((item) => item.window)).toEqual(FINAL_CORRECTION_WINDOWS);
    expect(report.stableReleaseGates.map((item) => item.gate)).toEqual(STABLE_RELEASE_GATES);
  });

  it("marks stable gates as satisfied", () => {
    expect(stableGateIsSatisfied("public-api-v1-webhooks-feeds-sdk-types")).toBe(true);
    expect(stableGateIsSatisfied("unknown")).toBe(false);
  });

  it("keeps final release docs aligned", () => {
    const docs = readText("docs/final-release-gates.md");

    for (const item of [
      ...RC_FIX_AREAS,
      ...FINAL_BETA_FREEZE_CONTRACTS,
      ...GATE_EVIDENCE_TYPES,
      ...COMPATIBILITY_TARGETS,
      ...FINAL_CORRECTION_WINDOWS,
      ...STABLE_RELEASE_GATES,
    ]) {
      expect(docs).toContain(item);
    }
  });
});
