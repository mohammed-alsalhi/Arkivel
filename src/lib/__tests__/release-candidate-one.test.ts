import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  RC1_CHECKLISTS,
  RC1_DEPLOYMENT_PATHS,
  RC1_REQUIRED_GATES,
  RC1_VALIDATION_AREAS,
  createReleaseCandidateOneReport,
  rc1GateIsRequired,
} from "../release-candidate-one";

const root = process.cwd();

function readText(file: string) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("release candidate one", () => {
  it("publishes required gate evidence", () => {
    const report = createReleaseCandidateOneReport();

    expect(report.contract.apiRoute).toBe("/api/release-candidate-one");
    expect(report.gateEvidence.map((item) => item.gate)).toEqual(RC1_REQUIRED_GATES);
    expect(rc1GateIsRequired("build")).toBe(true);
    expect(rc1GateIsRequired("new-feature")).toBe(false);
  });

  it("tracks deployment paths, validation areas, and checklists", () => {
    const report = createReleaseCandidateOneReport();

    expect(report.deploymentPaths.map((item) => item.path)).toEqual(RC1_DEPLOYMENT_PATHS);
    expect(report.validationAreas.map((item) => item.area)).toEqual(RC1_VALIDATION_AREAS);
    expect(report.checklists.map((item) => item.checklist)).toEqual(RC1_CHECKLISTS);
  });

  it("keeps release candidate docs and feedback template aligned", () => {
    const docs = readText("docs/release-candidate-one.md");
    const template = readText("docs/rc-feedback-template.md");

    for (const item of [...RC1_REQUIRED_GATES, ...RC1_DEPLOYMENT_PATHS, ...RC1_VALIDATION_AREAS, ...RC1_CHECKLISTS]) {
      expect(docs).toContain(item);
    }

    expect(template).toContain("Environment");
    expect(template).toContain("Regression");
    expect(template).toContain("Evidence");
  });
});
