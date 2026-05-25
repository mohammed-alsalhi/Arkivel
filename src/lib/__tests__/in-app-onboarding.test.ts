import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADMIN_ONBOARDING_GUIDES,
  CONTEXTUAL_HELP_PANELS,
  FIRST_RUN_CHECKLIST,
  ONBOARDING_SCREENSHOT_CHECKPOINTS,
  SAMPLE_CONTENT_PACKS,
  createInAppOnboardingReport,
  onboardingStepIsRequired,
} from "../in-app-onboarding";

const root = process.cwd();

function readText(file: string) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("in-app onboarding", () => {
  it("publishes the first-run checklist in order", () => {
    const report = createInAppOnboardingReport();

    expect(report.contract.apiRoute).toBe("/api/in-app-onboarding");
    expect(report.firstRunChecklist.map((item) => item.id)).toEqual(FIRST_RUN_CHECKLIST);
    expect(onboardingStepIsRequired("database")).toBe(true);
    expect(onboardingStepIsRequired("theme")).toBe(false);
  });

  it("covers guided admin onboarding and contextual help panels", () => {
    const report = createInAppOnboardingReport();

    expect(report.adminGuides.map((item) => item.id)).toEqual(ADMIN_ONBOARDING_GUIDES);
    expect(report.contextualHelpPanels.map((item) => item.id)).toEqual(CONTEXTUAL_HELP_PANELS.map((item) => item.id));
    expect(report.contextualHelpPanels.every((item) => item.clutterGuard === "collapsed-by-default")).toBe(true);
  });

  it("keeps sample content packs and screenshot checkpoints documented", () => {
    const report = createInAppOnboardingReport();
    const docs = readText("docs/in-app-onboarding.md");

    for (const pack of SAMPLE_CONTENT_PACKS) {
      expect(fs.existsSync(path.join(root, pack.path))).toBe(true);
      expect(docs).toContain(pack.id);
    }

    for (const checkpoint of ONBOARDING_SCREENSHOT_CHECKPOINTS) {
      expect(docs).toContain(checkpoint);
    }

    expect(report.sampleContentPacks).toEqual(SAMPLE_CONTENT_PACKS);
  });
});
