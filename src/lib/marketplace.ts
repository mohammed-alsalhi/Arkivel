export type MarketplaceItemKind =
  | "style"
  | "color-theme"
  | "layout"
  | "component-pack"
  | "plugin"
  | "theme-pack";
export type MarketplaceItemStatus = "built-in" | "planned" | "experimental";
export type ComponentPackSlot =
  | "article-card"
  | "metadata-panel"
  | "dashboard-widget"
  | "homepage-section"
  | "infobox-layout";

export type MarketplaceItem = {
  author: string;
  compatibility: string;
  description: string;
  id: string;
  kind: MarketplaceItemKind;
  name: string;
  status: MarketplaceItemStatus;
  tags: string[];
};

export type MarketplaceValidationResult = {
  errors: string[];
  valid: boolean;
};

export type StylePreset = MarketplaceItem & {
  kind: "style";
  themeAttribute: string;
};

export type ColorThemePreset = MarketplaceItem & {
  kind: "color-theme";
  themeAttribute: string;
};

export type LayoutPreset = MarketplaceItem & {
  kind: "layout";
  envValue: string;
};

export type ComponentPack = MarketplaceItem & {
  kind: "component-pack";
  slots: ComponentPackSlot[];
};

export type PluginManifest = MarketplaceItem & {
  kind: "plugin";
  hooks: string[];
  permissions: string[];
  routes: string[];
  settings: string[];
  version: string;
  widgets: string[];
};

export type ThemePack = MarketplaceItem & {
  kind: "theme-pack";
  tokens: Record<string, string>;
  version: string;
};

export type ThemePackInput = {
  author?: unknown;
  compatibility?: unknown;
  id?: unknown;
  kind?: unknown;
  name?: unknown;
  tokens?: unknown;
  version?: unknown;
};

export type PluginManifestInput = {
  compatibility?: unknown;
  hooks?: unknown;
  id?: unknown;
  kind?: unknown;
  name?: unknown;
  permissions?: unknown;
  routes?: unknown;
  settings?: unknown;
  version?: unknown;
  widgets?: unknown;
};

export const stylePresets = [
  {
    id: "classic-wiki",
    kind: "style",
    name: "Classic Wiki",
    description: "The default conservative encyclopedia skin with serif headings and dense content-first surfaces.",
    author: "Arkivel",
    compatibility: ">=4.74.5",
    status: "built-in",
    tags: ["wiki", "dense", "serif", "default"],
    themeAttribute: "classic-wiki",
  },
  {
    id: "atlas-modern",
    kind: "style",
    name: "Atlas Modern",
    description: "A calmer open-source product skin with softer borders, roomier panels, and a modern editorial feel.",
    author: "Arkivel",
    compatibility: ">=4.74.5",
    status: "built-in",
    tags: ["modern", "editorial", "self-hosted", "soft"],
    themeAttribute: "atlas-modern",
  },
] satisfies StylePreset[];

export const colorThemePresets = [
  {
    id: "standard",
    kind: "color-theme",
    name: "Standard",
    description: "The default neutral blue wiki palette.",
    author: "Arkivel",
    compatibility: ">=4.74.6",
    status: "built-in",
    tags: ["default", "neutral", "blue", "wiki"],
    themeAttribute: "standard",
  },
  {
    id: "forest",
    kind: "color-theme",
    name: "Forest",
    description: "A calm green palette for teams that want a softer knowledge workspace.",
    author: "Arkivel",
    compatibility: ">=4.74.6",
    status: "built-in",
    tags: ["green", "calm", "editorial"],
    themeAttribute: "forest",
  },
  {
    id: "ember",
    kind: "color-theme",
    name: "Ember",
    description: "A warm amber palette for personal libraries and creative archives.",
    author: "Arkivel",
    compatibility: ">=4.74.6",
    status: "built-in",
    tags: ["warm", "amber", "personal"],
    themeAttribute: "ember",
  },
] satisfies ColorThemePreset[];

export const layoutPresets: LayoutPreset[] = [
  {
    id: "layout-classic-wiki",
    kind: "layout",
    name: "Classic Wiki",
    description: "Dense encyclopedia shell with sidebar navigation, article-first reading, and compact admin surfaces.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "built-in",
    tags: ["wiki", "default", "dense"],
    envValue: "classic-wiki",
  },
  {
    id: "layout-docs-portal",
    kind: "layout",
    name: "Docs Portal",
    description: "Documentation-oriented navigation and preview metadata for support and developer portals.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "planned",
    tags: ["docs", "portal", "support"],
    envValue: "docs-portal",
  },
  {
    id: "layout-team-knowledge-base",
    kind: "layout",
    name: "Team Knowledge Base",
    description: "Team operations layout metadata for onboarding, SOPs, ownership, and review workflows.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "planned",
    tags: ["team", "operations", "knowledge-base"],
    envValue: "team-knowledge-base",
  },
  {
    id: "layout-worldbuilding-atlas",
    kind: "layout",
    name: "Worldbuilding Atlas",
    description: "Atlas-first layout metadata for canon, maps, territories, characters, and relationships.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "planned",
    tags: ["worldbuilding", "atlas", "canon"],
    envValue: "worldbuilding-atlas",
  },
  {
    id: "layout-research-notebook",
    kind: "layout",
    name: "Research Notebook",
    description: "Research-oriented layout metadata for notes, citations, claims, revisions, and synthesis.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "planned",
    tags: ["research", "notes", "citations"],
    envValue: "research-notebook",
  },
];

export const componentPacks: ComponentPack[] = [
  {
    id: "core-wiki-components",
    kind: "component-pack",
    name: "Core Wiki Components",
    description: "Built-in reusable article cards, panels, lists, data tables, empty states, and definition surfaces.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "built-in",
    tags: ["core", "ui", "built-in"],
    slots: ["article-card", "metadata-panel", "dashboard-widget", "homepage-section", "infobox-layout"],
  },
  {
    id: "operations-component-pack",
    kind: "component-pack",
    name: "Operations Component Pack",
    description: "Reusable dashboard and admin components for teams using Arkivel as an internal knowledge operations hub.",
    author: "Arkivel",
    compatibility: "future",
    status: "planned",
    tags: ["dashboard", "admin", "operations"],
    slots: ["dashboard-widget", "metadata-panel", "homepage-section"],
  },
  {
    id: "canon-worldbuilding-pack",
    kind: "component-pack",
    name: "Canon Worldbuilding Pack",
    description: "Worldbuilding-oriented article cards, metadata panels, map modules, and relationship widgets.",
    author: "Arkivel",
    compatibility: "future",
    status: "planned",
    tags: ["worldbuilding", "canon", "map", "relationships"],
    slots: ["article-card", "metadata-panel", "infobox-layout", "homepage-section"],
  },
];

export const pluginManifests: PluginManifest[] = [
  {
    id: "web-clipper-plugin",
    kind: "plugin",
    name: "Web Clipper Plugin",
    description: "Package the bookmarklet and browser clipper workflow as an installable extension point.",
    author: "Arkivel",
    compatibility: "future",
    status: "planned",
    tags: ["capture", "import", "browser"],
    version: "0.1.0",
    permissions: ["article:create", "asset:read"],
    routes: ["/bookmarklet", "/clipper-extension"],
    settings: ["baseUrl", "defaultCategoryId"],
    widgets: ["capture-button"],
    hooks: ["article.beforeCreate", "article.afterCreate"],
  },
];

export const themePacks: ThemePack[] = [
  {
    id: "forest-theme-pack",
    kind: "theme-pack",
    name: "Forest Theme Pack",
    description: "Exportable sample pack for the built-in Forest color theme.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "built-in",
    tags: ["theme", "forest", "green"],
    version: "1.0.0",
    tokens: {
      "--color-accent": "#26734d",
      "--color-background": "#f5f8f3",
      "--color-surface": "#ffffff",
      "--color-foreground": "#1f2d24",
    },
  },
];

export const marketplaceItems = [
  ...stylePresets,
  ...colorThemePresets,
  ...layoutPresets,
  ...componentPacks,
  ...pluginManifests,
  ...themePacks,
] satisfies MarketplaceItem[];

export function resolveStylePreset(styleId: string | undefined): StylePreset {
  return stylePresets.find((style) => style.id === styleId) ?? stylePresets[0];
}

export function resolveColorThemePreset(themeId: string | undefined): ColorThemePreset {
  return colorThemePresets.find((theme) => theme.id === themeId) ?? colorThemePresets[0];
}

export function resolveLayoutPreset(layoutId: string | undefined): LayoutPreset {
  return layoutPresets.find((layout) => layout.id === layoutId || layout.envValue === layoutId) ?? layoutPresets[0];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(hasString);
}

export function validateThemePack(input: ThemePackInput): MarketplaceValidationResult {
  const errors: string[] = [];
  if (!hasString(input.id)) errors.push("id is required");
  if (!hasString(input.name)) errors.push("name is required");
  if (input.kind !== "theme-pack") errors.push("kind must be theme-pack");
  if (!hasString(input.version)) errors.push("version is required");
  if (!hasString(input.compatibility)) errors.push("compatibility is required");
  if (!isRecord(input.tokens)) {
    errors.push("tokens must be an object");
  } else {
    for (const [key, value] of Object.entries(input.tokens)) {
      if (!key.startsWith("--color-") && !key.startsWith("--font-")) {
        errors.push(`token ${key} must be a supported CSS variable`);
      }
      if (!hasString(value)) {
        errors.push(`token ${key} must have a string value`);
      }
    }
  }
  return { errors, valid: errors.length === 0 };
}

export function validatePluginManifest(input: PluginManifestInput): MarketplaceValidationResult {
  const errors: string[] = [];
  if (!hasString(input.id)) errors.push("id is required");
  if (!hasString(input.name)) errors.push("name is required");
  if (input.kind !== "plugin") errors.push("kind must be plugin");
  if (!hasString(input.version)) errors.push("version is required");
  if (!hasString(input.compatibility)) errors.push("compatibility is required");
  if (!hasStringArray(input.permissions)) errors.push("permissions must be a string array");
  if (!hasStringArray(input.routes)) errors.push("routes must be a string array");
  if (!hasStringArray(input.settings)) errors.push("settings must be a string array");
  if (!hasStringArray(input.widgets)) errors.push("widgets must be a string array");
  if (!hasStringArray(input.hooks)) errors.push("hooks must be a string array");
  if (hasStringArray(input.routes) && input.routes.some((route) => !route.startsWith("/"))) {
    errors.push("routes must start with /");
  }
  if (hasStringArray(input.permissions) && input.permissions.some((permission) => !permission.includes(":"))) {
    errors.push("permissions must use resource:action format");
  }
  return { errors, valid: errors.length === 0 };
}

export function validateMarketplaceCatalog(items: MarketplaceItem[] = marketplaceItems): MarketplaceValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();
  const requiredKinds: MarketplaceItemKind[] = [
    "style",
    "color-theme",
    "layout",
    "component-pack",
    "plugin",
    "theme-pack",
  ];
  const kinds = new Set(items.map((item) => item.kind));

  for (const item of items) {
    if (ids.has(item.id)) errors.push(`duplicate marketplace id: ${item.id}`);
    ids.add(item.id);
    if (!hasString(item.name)) errors.push(`${item.id} is missing a name`);
    if (!hasString(item.description)) errors.push(`${item.id} is missing a description`);
    if (!hasString(item.compatibility)) errors.push(`${item.id} is missing compatibility`);
    if (!Array.isArray(item.tags) || item.tags.length === 0) errors.push(`${item.id} must include tags`);
  }

  for (const kind of requiredKinds) {
    if (!kinds.has(kind)) errors.push(`missing marketplace kind: ${kind}`);
  }

  return { errors, valid: errors.length === 0 };
}

export const themePackSchema = {
  id: "Stable machine-readable pack id",
  name: "Human-readable pack name",
  kind: "theme-pack",
  version: "Pack version, for example 1.0.0",
  compatibility: "Arkivel version range, for example >=4.75.0",
  author: "Pack author",
  tokens: {
    "--color-accent": "CSS color token value",
  },
};

export const perSpaceCustomizationContract = {
  source: "category",
  status: "preview-only",
  inherits: ["global brand", "global style", "global color theme", "global layout"],
  fields: ["styleId", "colorThemeId", "layoutId", "templateIds", "metadataSchemaId", "navigationMode"],
  precedence: ["category preview", "global env customization", "Arkivel defaults"],
  persistence: "deferred; no database overrides in v1",
};
