import { describe, expect, it } from "vitest";
import {
  ASSISTANT_PACK_SCHEMA_VERSION,
  assistantPackDefaults,
  builtInAssistantPacks,
  canAssistantAccessSpace,
  createAssistantPackReport,
  validateAssistantPack,
} from "../assistant-packs";

describe("assistant packs", () => {
  it("publishes the assistant pack contract and graceful fallback", () => {
    const report = createAssistantPackReport();

    expect(report.contract.schemaVersion).toBe(ASSISTANT_PACK_SCHEMA_VERSION);
    expect(report.contract.adminRoute).toBe("/admin/assistants");
    expect(report.degradation.fallbackMode).toBe("heuristic-or-disabled");
    expect(report.privacyFirstRecommendations.length).toBeGreaterThan(0);
  });

  it("defines disabled and configured provider packs", () => {
    expect(assistantPackDefaults[0].id).toBe("ai-disabled");
    expect(assistantPackDefaults[0].privacy).toBe("local-only");
    expect(assistantPackDefaults[1].permissions).toContain("article:read");
    expect(assistantPackDefaults[1].safetyNotes.join(" ")).toContain("human review");
  });

  it("validates required manifest fields", () => {
    expect(validateAssistantPack(assistantPackDefaults[0]).valid).toBe(true);
    expect(validateAssistantPack({ ...assistantPackDefaults[1], permissions: [] }).warnings[0]).toContain("permissions");
  });

  it("publishes all v4.92.1 built-in assistant packs", () => {
    expect(builtInAssistantPacks.map((pack) => pack.id)).toEqual([
      "drafting-assistant",
      "summarization-assistant",
      "search-assistant",
      "claim-extraction-assistant",
      "taxonomy-assistant",
      "alt-text-assistant",
      "import-cleanup-assistant",
      "review-assistant",
    ]);
    expect(builtInAssistantPacks.every((pack) => pack.enabledByDefault === false)).toBe(true);
  });

  it("publishes prompt previews, usage logs, and permission boundaries", () => {
    const report = createAssistantPackReport();

    expect(report.promptPreviews.find((preview) => preview.packId === "search-assistant")?.redactions).toContain("unselected articles");
    expect(report.usageLogging.map((rule) => rule.event)).toEqual(["assistant.preview", "assistant.run"]);
    expect(canAssistantAccessSpace("search-assistant", "public-docs")).toBe(true);
    expect(canAssistantAccessSpace("search-assistant", "team")).toBe(false);
  });
});
