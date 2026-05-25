import { describe, expect, it } from "vitest";
import {
  MOBILE_POLISH_SURFACES,
  createMobilePolishReport,
  createMobileRegressionChecklist,
  getMobileQaCheckpoint,
} from "../mobile-polish";

describe("mobile polish", () => {
  it("covers every required mobile polish surface", () => {
    const report = createMobilePolishReport();

    expect(report.contract.apiRoute).toBe("/api/mobile-polish");
    expect(report.responsiveQa.map((checkpoint) => checkpoint.surface)).toEqual(MOBILE_POLISH_SURFACES);
  });

  it("publishes phone, tablet, laptop, and wide desktop QA for every checkpoint", () => {
    const checklist = createMobileRegressionChecklist();

    expect(checklist).toHaveLength(MOBILE_POLISH_SURFACES.length);
    for (const item of checklist) {
      expect(item.viewports).toEqual(["390x844", "768x1024", "1366x768", "1440x1100"]);
      expect(item.checks.join(" ")).toContain("No horizontal overflow");
      expect(item.checks.join(" ")).toContain("44px");
    }
  });

  it("returns targeted checkpoint metadata", () => {
    const checkpoint = getMobileQaCheckpoint("customization-previews");

    expect(checkpoint?.route).toBe("/admin/customization");
    expect(checkpoint?.checks.join(" ")).toContain("Preview frames");
  });
});
