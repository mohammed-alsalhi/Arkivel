import { describe, expect, it } from "vitest";
import { analyzeCustomizationDraft, type CustomizationDiagnosticsDraft } from "../customization-diagnostics";

const manifest = {
  colorThemePresets: [{ id: "standard" }, { id: "forest" }],
  layoutPresets: [
    { envValue: "classic-wiki", name: "Classic Wiki", status: "built-in" },
    { envValue: "docs-portal", name: "Docs Portal", status: "planned" },
  ],
  stylePresets: [{ id: "classic-wiki" }, { id: "atlas-modern" }],
  version: "4.77.0",
};

const draft: CustomizationDiagnosticsDraft = {
  appIcon: "/brand/icon.png",
  baseUrl: "https://example.com",
  colorThemeId: "standard",
  description: "A knowledge base",
  layoutId: "classic-wiki",
  logo: "/brand/logo.png",
  logoMark: "/brand/mark.svg",
  mapEnabled: false,
  name: "Example Wiki",
  styleId: "classic-wiki",
  tagline: "One place for knowledge",
  welcomeText: "Welcome to the wiki.",
};

describe("customization diagnostics", () => {
  it("passes a complete built-in customization draft", () => {
    const report = analyzeCustomizationDraft(draft, manifest, "2026-05-24T00:00:00.000Z");

    expect(report.counts.error).toBe(0);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "style-known")).toBe(true);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "layout-built-in")).toBe(true);
  });

  it("flags missing assets, invalid URLs, and unknown presets", () => {
    const report = analyzeCustomizationDraft(
      {
        ...draft,
        appIcon: "icon",
        baseUrl: "example.com",
        colorThemeId: "custom-theme",
        layoutId: "custom-layout",
        logo: "",
        styleId: "custom-style",
      },
      manifest,
      "2026-05-24T00:00:00.000Z",
    );

    expect(report.counts.error).toBeGreaterThanOrEqual(5);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "asset-logo-missing")).toBe(true);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "base-url-invalid")).toBe(true);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "style-unknown")).toBe(true);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "color-theme-unknown")).toBe(true);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "layout-unknown")).toBe(true);
  });

  it("warns for planned layouts and alternate color themes", () => {
    const report = analyzeCustomizationDraft(
      {
        ...draft,
        colorThemeId: "forest",
        layoutId: "docs-portal",
      },
      manifest,
      "2026-05-24T00:00:00.000Z",
    );

    expect(report.counts.warning).toBeGreaterThanOrEqual(2);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "layout-planned")).toBe(true);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "palette-one-note-review")).toBe(true);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "contrast-alt-theme-review")).toBe(true);
    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "dark-theme-contrast-review")).toBe(true);
  });

  it("warns when custom brand assets need size review", () => {
    const report = analyzeCustomizationDraft(draft, manifest, "2026-05-24T00:00:00.000Z");

    expect(report.diagnostics.some((diagnostic) => diagnostic.id === "brand-asset-size-review")).toBe(true);
  });
});
