import { describe, expect, it } from "vitest";
import {
  getLayoutComposition,
  layoutCompositionHooks,
  validateLayoutComposition,
} from "../layout-composition";
import { layoutPresets } from "../marketplace";

describe("layout composition", () => {
  it("declares hooks for every built-in layout preset", () => {
    expect(layoutCompositionHooks.map((layout) => layout.id)).toEqual([
      "classic-wiki",
      "docs-portal",
      "team-knowledge-base",
      "worldbuilding-atlas",
      "research-notebook",
    ]);
    expect(layoutPresets.map((preset) => preset.composition.id)).toEqual(layoutPresets.map((preset) => preset.envValue));
  });

  it("publishes composition hooks for shell, homepage, article, dashboard, and category surfaces", () => {
    for (const layout of layoutCompositionHooks) {
      expect(layout.cssHooks.some((hook) => hook.includes(`data-layout="${layout.id}"`))).toBe(true);
      expect(layout.homepageModuleOrder.length).toBeGreaterThan(2);
      expect(layout.dashboardModules.length).toBeGreaterThan(2);
      expect(layout.articleColumns).toBeTruthy();
      expect(layout.rightRail).toBeTruthy();
      expect(layout.categoryLanding).toBeTruthy();
    }
  });

  it("falls back to classic wiki for unknown active layout metadata", () => {
    expect(getLayoutComposition("docs-portal").id).toBe("docs-portal");
    expect(validateLayoutComposition("future-layout")).toMatchObject({
      fallbackUsed: true,
      valid: false,
    });
    expect(validateLayoutComposition("future-layout").active.id).toBe("classic-wiki");
  });
});
