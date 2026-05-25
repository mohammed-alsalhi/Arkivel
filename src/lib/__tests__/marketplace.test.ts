import { describe, expect, it } from "vitest";
import {
  colorThemePresets,
  componentPacks,
  createMarketplaceRegistry,
  layoutPresets,
  marketplaceCatalogSource,
  marketplaceItems,
  marketplaceRegistryContract,
  type MarketplaceItem,
  pluginManifests,
  stylePresets,
  SUPPORTED_MARKETPLACE_KINDS,
  SUPPORTED_MARKETPLACE_LICENSES,
  themePacks,
  validateMarketplaceCatalog,
  validatePluginManifest,
  validateThemePack,
} from "../marketplace";

describe("marketplace", () => {
  it("covers every first-class marketplace kind", () => {
    const kinds = new Set(marketplaceItems.map((item) => item.kind));

    expect(kinds).toEqual(
      new Set(["style", "color-theme", "layout", "component-pack", "plugin", "theme-pack"]),
    );
    expect(SUPPORTED_MARKETPLACE_KINDS).toHaveLength(6);
  });

  it("declares component-pack slots", () => {
    expect(componentPacks.some((pack) => pack.slots.includes("article-card"))).toBe(true);
    expect(componentPacks.every((pack) => pack.slots.length > 0)).toBe(true);
  });

  it("provides layout presets and plugin manifest examples", () => {
    expect(layoutPresets.some((layout) => layout.envValue === "research-notebook")).toBe(true);
    expect(pluginManifests[0].routes).toContain("/clipper-extension");
  });

  it("publishes a versioned local registry contract", () => {
    const registry = createMarketplaceRegistry();

    expect(registry.id).toBe("arkivel-local-marketplace");
    expect(registry.schemaVersion).toBe("arkivel.marketplace.registry.v1");
    expect(registry.source).toEqual(marketplaceCatalogSource);
    expect(registry.source.remote).toBe(false);
    expect(registry.contract).toEqual(marketplaceRegistryContract);
    expect(registry.supportedLicenses).toEqual(SUPPORTED_MARKETPLACE_LICENSES);
    expect(registry.validation.valid).toBe(true);
    expect(registry.validation.summary?.itemCount).toBe(marketplaceItems.length);
  });

  it("adds registry metadata to every marketplace item", () => {
    for (const item of marketplaceItems) {
      expect(item.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(item.license).toBeTruthy();
      expect(item.source.remote).toBe(false);
      expect(item.checksums.manifest).toMatch(/^local-fnv1a-[a-f0-9]{8}$/);
      expect(item.screenshots[0]).toMatch(/^\//);
    }

    expect(stylePresets[0].themeAttribute).toBe("classic-wiki");
    expect(colorThemePresets[0].themeAttribute).toBe("standard");
  });

  it("validates theme packs", () => {
    expect(validateThemePack(themePacks[0]).valid).toBe(true);
    expect(validateThemePack({ kind: "theme-pack" }).valid).toBe(false);
    expect(
      validateThemePack({
        compatibility: ">=4.75.0",
        id: "bad-theme",
        kind: "theme-pack",
        name: "Bad Theme",
        tokens: { colorAccent: "#fff" },
        version: "1.0.0",
      }).valid,
    ).toBe(false);
  });

  it("validates plugin manifests", () => {
    expect(validatePluginManifest(pluginManifests[0]).valid).toBe(true);
    expect(validatePluginManifest({ kind: "plugin" }).valid).toBe(false);
    expect(
      validatePluginManifest({
        compatibility: ">=4.75.0",
        hooks: ["article.afterCreate"],
        id: "bad-plugin",
        kind: "plugin",
        name: "Bad Plugin",
        permissions: ["articles"],
        routes: ["admin/plugin"],
        settings: [],
        version: "1.0.0",
        widgets: [],
      }).valid,
    ).toBe(false);
  });

  it("validates marketplace catalog integrity", () => {
    expect(validateMarketplaceCatalog().valid).toBe(true);
    expect(validateMarketplaceCatalog([themePacks[0], themePacks[0]]).valid).toBe(false);
  });

  it("reports every v4.77.0 registry failure mode", () => {
    const invalidItems = [
      { ...marketplaceItems[0], id: marketplaceItems[1].id },
      { ...marketplaceItems[0], id: "unsupported-kind", kind: "template-pack" },
      { ...marketplaceItems[0], id: "incompatible-version", compatibility: ">=99.0.0" },
      { ...marketplaceItems[0], id: "missing-screenshot", screenshots: [] },
      { ...pluginManifests[0], id: "unsafe-plugin", permissions: ["system:execute"] },
      { ...marketplaceItems[0], id: "invalid-license", license: "UNLICENSED" },
    ] as unknown as MarketplaceItem[];
    const result = validateMarketplaceCatalog([...marketplaceItems, ...invalidItems]);
    const codes = new Set(result.issues?.map((issue) => issue.code));

    expect(result.valid).toBe(false);
    expect(codes).toContain("duplicate-id");
    expect(codes).toContain("unsupported-kind");
    expect(codes).toContain("incompatible-version");
    expect(codes).toContain("missing-screenshot");
    expect(codes).toContain("unsafe-permission");
    expect(codes).toContain("invalid-license");
  });
});
