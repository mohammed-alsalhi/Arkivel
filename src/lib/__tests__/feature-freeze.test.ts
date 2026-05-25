import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FEATURE_FREEZE_ALLOWED_CHANGE_CLASSES,
  FEATURE_FREEZE_GATE_OWNERS,
  FULL_REHEARSAL_AREAS,
  RELEASE_NOTE_DRAFT_SECTIONS,
  changeClassAllowedDuringFreeze,
  createFeatureFreezeReport,
} from "../feature-freeze";

const root = process.cwd();

function readText(file: string) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("feature freeze", () => {
  it("publishes the freeze policy and allowed change classes", () => {
    const report = createFeatureFreezeReport();

    expect(report.contract.apiRoute).toBe("/api/release-freeze");
    expect(report.policy.allowedChangeClasses).toEqual(FEATURE_FREEZE_ALLOWED_CHANGE_CLASSES);
    expect(changeClassAllowedDuringFreeze("security-issue")).toBe(true);
    expect(changeClassAllowedDuringFreeze("new-feature")).toBe(false);
  });

  it("tracks full rehearsal areas and gate ownership", () => {
    const report = createFeatureFreezeReport();

    expect(report.rehearsalMatrix.map((item) => item.area)).toEqual(FULL_REHEARSAL_AREAS);
    expect(report.gateOwnership.map((item) => item.gate)).toEqual(FEATURE_FREEZE_GATE_OWNERS);
    expect(report.rehearsalMatrix.every((item) => item.evidenceRequired)).toBe(true);
  });

  it("keeps known issue and release note draft docs aligned", () => {
    const report = createFeatureFreezeReport();
    const docs = readText("docs/feature-freeze.md");
    const knownIssues = readText(report.knownIssuesReport.file);

    for (const section of RELEASE_NOTE_DRAFT_SECTIONS) {
      expect(docs).toContain(section);
    }
    for (const label of report.knownIssuesReport.blockerLabels) {
      expect(knownIssues).toContain(label);
    }
  });
});
