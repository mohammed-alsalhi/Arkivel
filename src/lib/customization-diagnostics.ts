export type DiagnosticSeverity = "pass" | "warning" | "error";

export type CustomizationDiagnostic = {
  detail: string;
  id: string;
  severity: DiagnosticSeverity;
  title: string;
};

export type CustomizationDiagnosticsDraft = {
  appIcon: string;
  baseUrl: string;
  colorThemeId: string;
  description: string;
  layoutId: string;
  logo: string;
  logoMark: string;
  mapEnabled: boolean;
  name: string;
  styleId: string;
  tagline: string;
  welcomeText: string;
};

export type CustomizationDiagnosticsManifest = {
  colorThemePresets: { id: string }[];
  layoutPresets: { envValue: string; name: string; status: string }[];
  stylePresets: { id: string }[];
  version: string;
};

export type CustomizationDiagnosticsReport = {
  counts: Record<DiagnosticSeverity, number>;
  diagnostics: CustomizationDiagnostic[];
  generatedAt: string;
  version: string;
};

function isAssetReference(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("/") || /^https?:\/\//.test(trimmed);
}

function hasImageLikeExtension(value: string) {
  return /\.(avif|gif|ico|jpe?g|png|svg|webp)(\?.*)?$/i.test(value.trim());
}

function isDefaultBrandAsset(value: string) {
  return [
    "/brand/arkivel-icon-512.png",
    "/brand/arkivel-logo.png",
    "/brand/arkivel-logo.svg",
  ].includes(value.trim());
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function add(diagnostics: CustomizationDiagnostic[], diagnostic: CustomizationDiagnostic) {
  diagnostics.push(diagnostic);
}

export function analyzeCustomizationDraft(
  draft: CustomizationDiagnosticsDraft,
  manifest: CustomizationDiagnosticsManifest,
  generatedAt = new Date().toISOString(),
): CustomizationDiagnosticsReport {
  const diagnostics: CustomizationDiagnostic[] = [];
  const knownStyles = new Set(manifest.stylePresets.map((preset) => preset.id));
  const knownThemes = new Set(manifest.colorThemePresets.map((preset) => preset.id));
  const layouts = new Map(manifest.layoutPresets.map((preset) => [preset.envValue, preset]));

  if (draft.name.trim()) {
    add(diagnostics, {
      detail: "The site name is present and can be used in shell chrome, feeds, metadata, and exports.",
      id: "brand-name-present",
      severity: "pass",
      title: "Site name present",
    });
  } else {
    add(diagnostics, {
      detail: "Set NEXT_PUBLIC_ARKIVEL_NAME before deploying so the instance does not render with an empty app name.",
      id: "brand-name-missing",
      severity: "error",
      title: "Site name is missing",
    });
  }

  if (!draft.tagline.trim() || !draft.description.trim() || !draft.welcomeText.trim()) {
    add(diagnostics, {
      detail: "Tagline, description, and welcome text should all be present so public metadata and first-run pages do not feel unfinished.",
      id: "brand-copy-incomplete",
      severity: "warning",
      title: "Brand copy is incomplete",
    });
  }

  [
    ["logo", "Full logo", draft.logo],
    ["logo-mark", "Logo mark", draft.logoMark],
    ["app-icon", "App icon", draft.appIcon],
  ].forEach(([id, title, value]) => {
    if (!value.trim()) {
      add(diagnostics, {
        detail: `${title} is empty. Use a public path such as /brand/arkivel-logo.png or an absolute HTTPS URL.`,
        id: `asset-${id}-missing`,
        severity: "error",
        title: `${title} missing`,
      });
      return;
    }

    if (!isAssetReference(value)) {
      add(diagnostics, {
        detail: `${title} should start with /, http://, or https:// so self-host deploys can resolve it predictably.`,
        id: `asset-${id}-invalid-reference`,
        severity: "error",
        title: `${title} path is invalid`,
      });
      return;
    }

    if (!hasImageLikeExtension(value)) {
      add(diagnostics, {
        detail: `${title} resolves like an asset path, but it does not end in a common image extension. Confirm the deployed file returns an image response.`,
        id: `asset-${id}-extension-warning`,
        severity: "warning",
        title: `${title} extension is unusual`,
      });
      return;
    }

    add(diagnostics, {
      detail: `${title} uses a deployable image-like path or URL.`,
      id: `asset-${id}-valid`,
      severity: "pass",
      title: `${title} looks valid`,
    });
  });

  if (isValidUrl(draft.baseUrl)) {
    add(diagnostics, {
      detail: "The canonical base URL uses an HTTP or HTTPS URL and can be used for metadata, feeds, sitemaps, and share links.",
      id: "base-url-valid",
      severity: "pass",
      title: "Base URL is valid",
    });
  } else {
    add(diagnostics, {
      detail: "NEXT_PUBLIC_BASE_URL should be a full http:// or https:// URL.",
      id: "base-url-invalid",
      severity: "error",
      title: "Base URL is invalid",
    });
  }

  if (knownStyles.has(draft.styleId)) {
    add(diagnostics, {
      detail: "The selected style preset is registered in the built-in marketplace metadata.",
      id: "style-known",
      severity: "pass",
      title: "Style preset is supported",
    });
  } else {
    add(diagnostics, {
      detail: "Unknown style ids fall back to classic-wiki at runtime. Add the style to marketplace metadata before deploying it.",
      id: "style-unknown",
      severity: "error",
      title: "Style preset is unknown",
    });
  }

  if (knownThemes.has(draft.colorThemeId)) {
    add(diagnostics, {
      detail: "The selected color theme is registered and can be applied through html[data-color-theme].",
      id: "color-theme-known",
      severity: "pass",
      title: "Color theme is supported",
    });
  } else {
    add(diagnostics, {
      detail: "Unknown color theme ids fall back to standard at runtime. Register the palette before deploying it.",
      id: "color-theme-unknown",
      severity: "error",
      title: "Color theme is unknown",
    });
  }

  const selectedLayout = layouts.get(draft.layoutId);
  if (!selectedLayout) {
    add(diagnostics, {
      detail: "Unknown layout ids fall back to classic-wiki at runtime. Register the layout before deploying it.",
      id: "layout-unknown",
      severity: "error",
      title: "Layout preset is unknown",
    });
  } else if (selectedLayout.status === "planned") {
    add(diagnostics, {
      detail: `${selectedLayout.name} is registered as planned metadata. It is safe for preview, but the full runtime shell still uses documented hooks until that layout graduates.`,
      id: "layout-planned",
      severity: "warning",
      title: "Layout is preview metadata",
    });
  } else {
    add(diagnostics, {
      detail: "The selected layout is built in and has a stable env value.",
      id: "layout-built-in",
      severity: "pass",
      title: "Layout is built in",
    });
  }

  add(diagnostics, {
    detail: "Built-in palettes use shared theme tokens for background, surface, foreground, muted text, borders, links, warnings, code blocks, buttons, and navigation. Run visual QA after adding custom tokens.",
    id: "contrast-token-coverage",
    severity: "pass",
    title: "Contrast token coverage is available",
  });

  if (draft.colorThemeId !== "standard") {
    add(diagnostics, {
      detail: "Alternate palettes should include neutral surfaces, semantic success/warning/danger states, and non-accent text colors so the UI does not become a single-hue theme.",
      id: "palette-one-note-review",
      severity: "warning",
      title: "One-note palette review recommended",
    });
    add(diagnostics, {
      detail: "Alternate palettes should be checked against article body text, links, buttons, warning notices, code blocks, tables, and shell navigation before deployment.",
      id: "contrast-alt-theme-review",
      severity: "warning",
      title: "Manual contrast review recommended",
    });
    add(diagnostics, {
      detail: "Dark mode token overrides should be checked with the selected color theme, especially muted text, borders, inline code, tab states, and warning notices.",
      id: "dark-theme-contrast-review",
      severity: "warning",
      title: "Dark theme contrast review recommended",
    });
  } else {
    add(diagnostics, {
      detail: "The standard palette keeps a neutral base with semantic state colors. Recheck this when overriding color tokens.",
      id: "palette-balance-baseline",
      severity: "pass",
      title: "Palette balance baseline is available",
    });
  }

  const customAssets = [draft.logo, draft.logoMark, draft.appIcon].filter((asset) => asset.trim() && !isDefaultBrandAsset(asset));
  if (customAssets.length > 0) {
    add(diagnostics, {
      detail: "Custom logos and app icons should be compressed, cacheable, and sized for their slots before deployment. The studio cannot measure local or remote image byte size in preview-only mode.",
      id: "brand-asset-size-review",
      severity: "warning",
      title: "Brand asset size review recommended",
    });
  } else {
    add(diagnostics, {
      detail: "Default Arkivel brand assets are sized for the app shell, metadata preview, and installable app icon slots.",
      id: "brand-asset-size-baseline",
      severity: "pass",
      title: "Brand asset size baseline is available",
    });
  }

  if (draft.mapEnabled) {
    add(diagnostics, {
      detail: "Map mode is enabled. Confirm NEXT_PUBLIC_MAP_IMAGE points to a deployed image before relying on map previews.",
      id: "map-image-review",
      severity: "warning",
      title: "Map image needs review",
    });
  }

  const counts = diagnostics.reduce(
    (current, diagnostic) => ({
      ...current,
      [diagnostic.severity]: current[diagnostic.severity] + 1,
    }),
    { error: 0, pass: 0, warning: 0 } satisfies Record<DiagnosticSeverity, number>,
  );

  return {
    counts,
    diagnostics,
    generatedAt,
    version: manifest.version,
  };
}
