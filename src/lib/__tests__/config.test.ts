import { describe, it, expect } from "vitest";
import { config } from "../config";
import { createCustomization, customizationOptions } from "../customization";

describe("config", () => {
  it("has default values", () => {
    expect(config.name).toBeDefined();
    expect(config.tagline).toBeDefined();
    expect(config.description).toBeDefined();
  });

  it("has correct default locale", () => {
    expect(config.defaultLocale).toBe("en");
  });

  it("has numeric articles per page", () => {
    expect(typeof config.articlesPerPage).toBe("number");
    expect(config.articlesPerPage).toBeGreaterThan(0);
  });

  it("has numeric max upload size", () => {
    expect(typeof config.maxUploadSize).toBe("number");
    expect(config.maxUploadSize).toBeGreaterThan(0);
  });

  it("has boolean flags", () => {
    expect(typeof config.mapEnabled).toBe("boolean");
    expect(typeof config.registrationEnabled).toBe("boolean");
    expect(typeof config.discussionsEnabled).toBe("boolean");
  });

  it("groups customization without breaking flat config compatibility", () => {
    expect(config.brand.name).toBe(config.name);
    expect(config.features.registrationEnabled).toBe(config.registrationEnabled);
    expect(config.limits.articlesPerPage).toBe(config.articlesPerPage);
    expect(config.map.enabled).toBe(config.mapEnabled);
  });

  it("parses self-host customization from env-like objects", () => {
    const custom = createCustomization({
      NEXT_PUBLIC_ARKIVEL_NAME: "My Wiki",
      NEXT_PUBLIC_ARKIVEL_STYLE: "atlas-modern",
      NEXT_PUBLIC_ARKIVEL_COLOR_THEME: "forest",
      NEXT_PUBLIC_ARTICLES_PER_PAGE: "42",
      NEXT_PUBLIC_ENABLE_REGISTRATION: "false",
      NEXT_PUBLIC_MAP_ENABLED: "true",
    });

    expect(custom.brand.name).toBe("My Wiki");
    expect(custom.style.id).toBe("atlas-modern");
    expect(custom.style.preset.themeAttribute).toBe("atlas-modern");
    expect(custom.style.colorThemeId).toBe("forest");
    expect(custom.style.colorTheme.themeAttribute).toBe("forest");
    expect(custom.limits.articlesPerPage).toBe(42);
    expect(custom.features.registrationEnabled).toBe(false);
    expect(custom.map.enabled).toBe(true);
  });

  it("falls back to the default style preset for unknown style ids", () => {
    const custom = createCustomization({
      NEXT_PUBLIC_ARKIVEL_STYLE: "my-future-marketplace-skin",
    });

    expect(custom.style.id).toBe("classic-wiki");
    expect(custom.style.preset.name).toBe("Classic Wiki");
  });

  it("falls back to the default color theme preset for unknown color theme ids", () => {
    const custom = createCustomization({
      NEXT_PUBLIC_ARKIVEL_COLOR_THEME: "my-future-palette",
    });

    expect(custom.style.colorThemeId).toBe("standard");
    expect(custom.style.colorTheme.name).toBe("Standard");
  });

  it("exposes customization option metadata", () => {
    expect(customizationOptions.length).toBeGreaterThan(0);
    expect(customizationOptions.some((option) => option.env === "NEXT_PUBLIC_ARKIVEL_NAME")).toBe(true);
    expect(customizationOptions.some((option) => option.env === "NEXT_PUBLIC_ARKIVEL_STYLE")).toBe(true);
    expect(customizationOptions.some((option) => option.env === "NEXT_PUBLIC_ARKIVEL_COLOR_THEME")).toBe(true);
  });
});
