import { describe, expect, it } from "vitest";
import {
  componentPacks,
  layoutPresets,
  marketplaceItems,
  pluginManifests,
  themePacks,
  validatePluginManifest,
  validateThemePack,
} from "../marketplace";

describe("marketplace", () => {
  it("covers every first-class marketplace kind", () => {
    const kinds = new Set(marketplaceItems.map((item) => item.kind));

    expect(kinds).toEqual(
      new Set(["style", "color-theme", "layout", "component-pack", "plugin", "theme-pack"]),
    );
  });

  it("declares component-pack slots", () => {
    expect(componentPacks.some((pack) => pack.slots.includes("article-card"))).toBe(true);
    expect(componentPacks.every((pack) => pack.slots.length > 0)).toBe(true);
  });

  it("provides layout presets and plugin manifest examples", () => {
    expect(layoutPresets.some((layout) => layout.id === "research-notebook")).toBe(true);
    expect(pluginManifests[0].routes).toContain("/clipper-extension");
  });

  it("validates theme packs", () => {
    expect(validateThemePack(themePacks[0]).valid).toBe(true);
    expect(validateThemePack({ kind: "theme-pack" }).valid).toBe(false);
  });

  it("validates plugin manifests", () => {
    expect(validatePluginManifest(pluginManifests[0]).valid).toBe(true);
    expect(validatePluginManifest({ kind: "plugin" }).valid).toBe(false);
  });
});
