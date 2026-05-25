import { describe, expect, it } from "vitest";
import {
  ACCESSIBILITY_AUDIT_SURFACES,
  createAccessibilityAuditMatrix,
  createAccessibilityFinishReport,
  hasAccessibilityBlocker,
} from "../accessibility-finish";

describe("accessibility finish", () => {
  it("audits every required accessibility surface", () => {
    const matrix = createAccessibilityAuditMatrix();

    expect(matrix.map((item) => item.surface)).toEqual(ACCESSIBILITY_AUDIT_SURFACES);
    expect(matrix.every((item) => item.releaseBlocking)).toBe(true);
  });

  it("publishes widget screen-reader summaries and contrast/motion checks", () => {
    const report = createAccessibilityFinishReport();

    expect(report.contract.apiRoute).toBe("/api/accessibility");
    expect(report.widgetSummaries.map((item) => item.widget)).toEqual(["graph", "atlas", "dashboard", "marketplace", "editor"]);
    expect(report.highContrastAndMotionChecks.map((item) => item.id)).toEqual(["high-contrast-focus", "reduced-motion"]);
  });

  it("marks known accessibility blockers as release-blocking", () => {
    const report = createAccessibilityFinishReport();

    expect(report.releaseGate.required).toBe(true);
    expect(report.releaseGate.status).toBe("required-before-v5");
    expect(hasAccessibilityBlocker(["keyboard trap"])).toBe(true);
    expect(hasAccessibilityBlocker(["copy polish"])).toBe(false);
  });

  it("publishes a contribution checklist", () => {
    const report = createAccessibilityFinishReport();

    expect(report.contributionChecklist.join(" ")).toContain("Icon-only actions");
    expect(report.contributionChecklist.join(" ")).toContain("reduced-motion");
  });
});
