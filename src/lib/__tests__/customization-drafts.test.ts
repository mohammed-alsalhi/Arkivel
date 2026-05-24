import { describe, expect, it } from "vitest";
import {
  applyCustomizationDraftPreset,
  createCustomizationDraftDiff,
  createSavedCustomizationDraft,
  DEFAULT_CUSTOMIZATION_DRAFT,
  parseSavedCustomizationDrafts,
} from "../customization-drafts";

describe("customization drafts", () => {
  it("applies named presets over the current draft", () => {
    const draft = applyCustomizationDraftPreset(DEFAULT_CUSTOMIZATION_DRAFT, "worldbuilding-atlas");

    expect(draft.name).toBe("Worldbuilding Atlas");
    expect(draft.styleId).toBe("atlas-modern");
    expect(draft.layoutId).toBe("worldbuilding-atlas");
    expect(draft.mapEnabled).toBe(true);
  });

  it("leaves the draft unchanged for unknown presets", () => {
    const draft = applyCustomizationDraftPreset(DEFAULT_CUSTOMIZATION_DRAFT, "unknown");

    expect(draft).toBe(DEFAULT_CUSTOMIZATION_DRAFT);
  });

  it("creates a visual diff between active and draft values", () => {
    const diff = createCustomizationDraftDiff(DEFAULT_CUSTOMIZATION_DRAFT, {
      ...DEFAULT_CUSTOMIZATION_DRAFT,
      colorThemeId: "forest",
      name: "Team Handbook",
      registrationEnabled: false,
    });

    expect(diff).toEqual([
      expect.objectContaining({ field: "colorThemeId", activeValue: "standard", draftValue: "forest" }),
      expect.objectContaining({ field: "name", activeValue: "Arkivel", draftValue: "Team Handbook" }),
      expect.objectContaining({ field: "registrationEnabled", activeValue: "Enabled", draftValue: "Disabled" }),
    ]);
  });

  it("creates and parses saved drafts safely", () => {
    const saved = createSavedCustomizationDraft(
      " My draft ",
      DEFAULT_CUSTOMIZATION_DRAFT,
      "2026-05-24T00:00:00.000Z",
      "draft-1",
    );

    expect(saved.name).toBe("My draft");
    expect(parseSavedCustomizationDrafts(JSON.stringify([saved]))).toEqual([saved]);
    expect(parseSavedCustomizationDrafts("not json")).toEqual([]);
    expect(parseSavedCustomizationDrafts(JSON.stringify([{ id: "missing-values" }]))).toEqual([]);
    expect(parseSavedCustomizationDrafts(JSON.stringify([{ ...saved, values: { name: "partial" } }]))).toEqual([]);
  });
});
