import { describe, expect, it } from "vitest";
import { defaultAuditSeverity } from "../audit";
import {
  aiAuditActions,
  createAssistantGovernanceReport,
  requiresHumanReview,
  shouldDisableAssistantForScope,
} from "../assistant-governance";

describe("assistant governance", () => {
  it("publishes privacy warnings, output requirements, and release gate", () => {
    const report = createAssistantGovernanceReport();

    expect(report.contract.apiRoute).toBe("/api/assistant-packs/governance");
    expect(report.privacyWarnings.join(" ")).toContain("outside the instance");
    expect(report.outputRequirements.citationPromptsFor).toContain("claim extraction");
    expect(report.releaseGate.checks).toContain("core editing works without AI");
  });

  it("declares AI audit actions and severity", () => {
    expect(aiAuditActions).toEqual([
      "ai.generate_content",
      "ai.rewrite",
      "ai.summarize",
      "ai.taxonomy_change",
    ]);
    expect(defaultAuditSeverity("ai.generate_content")).toBe("high");
  });

  it("enforces review and opt-out helpers", () => {
    expect(requiresHumanReview("generated content")).toBe(true);
    expect(shouldDisableAssistantForScope({ privateSpace: true })).toBe(true);
    expect(shouldDisableAssistantForScope({ sensitiveArticle: true })).toBe(true);
    expect(shouldDisableAssistantForScope({ privateSpace: true, explicitEnabled: true })).toBe(false);
  });
});
