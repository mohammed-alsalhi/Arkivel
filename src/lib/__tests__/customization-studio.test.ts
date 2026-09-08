import { describe, expect, it } from "vitest";
import {
  createCustomizationStudioSummary,
  CUSTOMIZATION_STUDIO_TABS,
  CUSTOMIZATION_STUDIO_VIEWPORTS,
  getNextCustomizationStudioTab,
} from "../customization-studio";
import { DEFAULT_CUSTOMIZATION_DRAFT } from "../customization-drafts";

describe("customization studio helpers", () => {
  it("declares tab metadata and responsive QA breakpoints", () => {
    expect(CUSTOMIZATION_STUDIO_TABS.map((tab) => tab.id)).toEqual([
      "brand",
      "drafts",
      "appearance",
      "features",
      "diagnostics",
      "preview",
      "output",
      "packs",
    ]);
    expect(CUSTOMIZATION_STUDIO_VIEWPORTS.map((viewport) => viewport.id)).toEqual([
      "mobile",
      "tablet",
      "laptop",
      "wide",
    ]);
    expect(CUSTOMIZATION_STUDIO_VIEWPORTS.every((viewport) => viewport.checks.length >= 3)).toBe(true);
  });

  it("supports roving tab keyboard navigation", () => {
    expect(getNextCustomizationStudioTab("brand", "ArrowRight")).toBe("drafts");
    expect(getNextCustomizationStudioTab("brand", "ArrowLeft")).toBe("packs");
    expect(getNextCustomizationStudioTab("appearance", "Home")).toBe("brand");
    expect(getNextCustomizationStudioTab("appearance", "End")).toBe("packs");
    expect(getNextCustomizationStudioTab("appearance", "Enter")).toBe("appearance");
  });

  it("creates a concise screen-reader summary", () => {
    const summary = createCustomizationStudioSummary({
      activeTab: "diagnostics",
      changedCount: 2,
      diagnostics: {
        counts: { error: 0, pass: 8, warning: 3 },
        diagnostics: [],
        generatedAt: "2026-05-24T00:00:00.000Z",
        version: "4.77.1",
      },
      draft: {
        ...DEFAULT_CUSTOMIZATION_DRAFT,
        colorThemeId: "forest",
        layoutId: "docs-portal",
      },
      themePackValid: false,
      version: "4.77.1",
    });

    expect(summary).toContain("Current tab: Diagnostics.");
    expect(summary).toContain("2 draft changes.");
    expect(summary).toContain("0 errors, 3 warnings, and 8 passes");
    expect(summary).toContain("theme pack JSON needs review");
  });
});
