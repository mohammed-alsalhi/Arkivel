import packageJson from "../../package.json";
import {
  isComponentSlotId,
  type ComponentSlotId,
} from "./component-slots";
import { getLayoutComposition, type LayoutCompositionHooks } from "./layout-composition";

export const MARKETPLACE_REGISTRY_ID = "arkivel-local-marketplace";
export const MARKETPLACE_REGISTRY_SCHEMA_VERSION = "arkivel.marketplace.registry.v1";
export const SUPPORTED_MARKETPLACE_KINDS = [
  "style",
  "color-theme",
  "layout",
  "component-pack",
  "plugin",
  "theme-pack",
  "template-pack",
] as const;
export const SUPPORTED_MARKETPLACE_LICENSES = [
  "MIT",
  "Apache-2.0",
  "CC-BY-4.0",
  "CC0-1.0",
  "MPL-2.0",
  "AGPL-3.0",
] as const;

export type MarketplaceItemKind = (typeof SUPPORTED_MARKETPLACE_KINDS)[number];
export type MarketplaceItemStatus =
  | "built-in"
  | "planned"
  | "experimental"
  | "local-only"
  | "deprecated"
  | "blocked";
export type MarketplaceItemLicense = (typeof SUPPORTED_MARKETPLACE_LICENSES)[number];
export type ComponentPackSlot = ComponentSlotId;

export type MarketplaceItemSource = {
  label: string;
  path: string;
  remote: boolean;
  type: "built-in" | "local";
};

export type MarketplaceItemChecksums = {
  manifest: string;
  screenshots?: Record<string, string>;
};

export type MarketplaceItem = {
  author: string;
  checksums: MarketplaceItemChecksums;
  compatibility: string;
  description: string;
  id: string;
  kind: MarketplaceItemKind;
  license: MarketplaceItemLicense;
  name: string;
  screenshots: string[];
  source: MarketplaceItemSource;
  status: MarketplaceItemStatus;
  tags: string[];
  version: string;
};

export type MarketplaceValidationIssue = {
  code:
    | "duplicate-id"
    | "unsupported-kind"
    | "missing-field"
    | "missing-required-kind"
    | "incompatible-version"
    | "missing-screenshot"
    | "invalid-license"
    | "unsafe-permission"
    | "missing-checksum"
    | "invalid-source";
  itemId?: string;
  kind?: string;
  message: string;
  severity: "error" | "warning";
};

export type MarketplaceValidationSummary = {
  errorCount: number;
  itemCount: number;
  kindCounts: Record<MarketplaceItemKind, number>;
  schemaVersion: string;
  source: typeof marketplaceCatalogSource;
  status: "healthy" | "warnings" | "errors";
  statusCounts: Record<MarketplaceItemStatus, number>;
  version: string;
  warningCount: number;
};

export type MarketplaceValidationResult = {
  errors: string[];
  issues?: MarketplaceValidationIssue[];
  summary?: MarketplaceValidationSummary;
  valid: boolean;
  warnings?: string[];
};

export type MarketplaceRegistry = {
  contract: typeof marketplaceRegistryContract;
  id: typeof MARKETPLACE_REGISTRY_ID;
  items: MarketplaceItem[];
  schemaVersion: typeof MARKETPLACE_REGISTRY_SCHEMA_VERSION;
  source: typeof marketplaceCatalogSource;
  supportedKinds: readonly MarketplaceItemKind[];
  supportedLicenses: readonly MarketplaceItemLicense[];
  validation: MarketplaceValidationResult;
  version: string;
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
  composition: LayoutCompositionHooks;
  kind: "layout";
  envValue: string;
};

export type ComponentPack = MarketplaceItem & {
  components: Array<{
    description: string;
    name: string;
    slot: ComponentPackSlot;
  }>;
  kind: "component-pack";
  recommendedLayout: string;
  slots: ComponentPackSlot[];
};

export type PluginManifest = MarketplaceItem & {
  kind: "plugin";
  hooks: string[];
  permissions: string[];
  routes: string[];
  settings: string[];
  widgets: string[];
};

export type ThemePack = MarketplaceItem & {
  kind: "theme-pack";
  tokens: Record<string, string>;
};

export type TemplatePack = MarketplaceItem & {
  articleTemplatePreview: string[];
  categoryTreePreview: string[];
  compatibilityNotes: string[];
  includedSchema: string[];
  includedTemplateIds: string[];
  kind: "template-pack";
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

export const marketplaceCatalogSource = {
  label: "Arkivel built-in local registry",
  path: "src/lib/marketplace.ts",
  remote: false,
  type: "built-in",
} as const;

export const marketplaceRegistryContract = {
  id: "Stable machine-readable listing id",
  kind: "style | color-theme | layout | component-pack | plugin | theme-pack | template-pack",
  version: "Semantic listing or pack version, for example 1.0.0",
  compatibility: "Arkivel version range, future marker, or exact version",
  author: "Listing author",
  license: "MIT | Apache-2.0 | CC-BY-4.0 | CC0-1.0 | MPL-2.0 | AGPL-3.0",
  source: {
    type: "built-in | local",
    path: "Local registry or pack path",
    remote: "false for the v1 local-first registry",
  },
  status: "built-in | planned | experimental | local-only | deprecated | blocked",
  checksums: {
    manifest: "Stable local manifest checksum",
    screenshots: "Optional screenshot checksum map",
  },
  screenshots: ["Local preview path"],
};

function createLocalChecksum(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `local-fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function registryMetadata({
  id,
  kind,
  license = "MIT",
  screenshots,
  version = "1.0.0",
}: {
  id: string;
  kind: MarketplaceItemKind;
  license?: MarketplaceItemLicense;
  screenshots?: string[];
  version?: string;
}) {
  const screenshotPaths = screenshots ?? [`/marketplace/${kind}/${id}.png`];
  const seed = `${kind}:${id}:${version}`;
  return {
    checksums: {
      manifest: createLocalChecksum(seed),
      screenshots: Object.fromEntries(
        screenshotPaths.map((path) => [path, createLocalChecksum(`${seed}:${path}`)]),
      ),
    },
    license,
    screenshots: screenshotPaths,
    source: {
      ...marketplaceCatalogSource,
      path: `${marketplaceCatalogSource.path}#${kind}:${id}`,
    },
    version,
  };
}

export const stylePresets = [
  {
    ...registryMetadata({ id: "classic-wiki", kind: "style" }),
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
    ...registryMetadata({ id: "atlas-modern", kind: "style" }),
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
    ...registryMetadata({ id: "standard", kind: "color-theme" }),
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
    ...registryMetadata({ id: "forest", kind: "color-theme" }),
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
    ...registryMetadata({ id: "ember", kind: "color-theme" }),
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
    ...registryMetadata({ id: "layout-classic-wiki", kind: "layout" }),
    id: "layout-classic-wiki",
    kind: "layout",
    name: "Classic Wiki",
    description: "Dense encyclopedia shell with sidebar navigation, article-first reading, and compact admin surfaces.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "built-in",
    tags: ["wiki", "default", "dense"],
    envValue: "classic-wiki",
    composition: getLayoutComposition("classic-wiki"),
  },
  {
    ...registryMetadata({ id: "layout-docs-portal", kind: "layout" }),
    id: "layout-docs-portal",
    kind: "layout",
    name: "Docs Portal",
    description: "Documentation-oriented navigation and preview metadata for support and developer portals.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "planned",
    tags: ["docs", "portal", "support"],
    envValue: "docs-portal",
    composition: getLayoutComposition("docs-portal"),
  },
  {
    ...registryMetadata({ id: "layout-team-knowledge-base", kind: "layout" }),
    id: "layout-team-knowledge-base",
    kind: "layout",
    name: "Team Knowledge Base",
    description: "Team operations layout metadata for onboarding, SOPs, ownership, and review workflows.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "planned",
    tags: ["team", "operations", "knowledge-base"],
    envValue: "team-knowledge-base",
    composition: getLayoutComposition("team-knowledge-base"),
  },
  {
    ...registryMetadata({ id: "layout-worldbuilding-atlas", kind: "layout" }),
    id: "layout-worldbuilding-atlas",
    kind: "layout",
    name: "Worldbuilding Atlas",
    description: "Atlas-first layout metadata for canon, maps, territories, characters, and relationships.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "planned",
    tags: ["worldbuilding", "atlas", "canon"],
    envValue: "worldbuilding-atlas",
    composition: getLayoutComposition("worldbuilding-atlas"),
  },
  {
    ...registryMetadata({ id: "layout-research-notebook", kind: "layout" }),
    id: "layout-research-notebook",
    kind: "layout",
    name: "Research Notebook",
    description: "Research-oriented layout metadata for notes, citations, claims, revisions, and synthesis.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "planned",
    tags: ["research", "notes", "citations"],
    envValue: "research-notebook",
    composition: getLayoutComposition("research-notebook"),
  },
];

export const componentPacks: ComponentPack[] = [
  {
    ...registryMetadata({ id: "default-wiki-components", kind: "component-pack" }),
    id: "default-wiki-components",
    kind: "component-pack",
    name: "Default Wiki Components",
    description: "Built-in dense wiki pack with compact article cards, practical metadata, classic infoboxes, and quick-edit affordances.",
    author: "Arkivel",
    compatibility: ">=4.78.1",
    status: "built-in",
    tags: ["default", "wiki", "dense", "quick-edit"],
    recommendedLayout: "classic-wiki",
    slots: ["article-card", "article-header", "metadata-panel", "infobox-layout", "dashboard-widget", "homepage-section", "search-result", "editor-panel", "space-navigation", "admin-summary"],
    components: [
      { slot: "article-card", name: "Dense Article Card", description: "Compact title, category, status, and excerpt preview for scan-heavy wiki lists." },
      { slot: "metadata-panel", name: "Compact Metadata Panel", description: "Small definition-list treatment for category, tags, relations, status, and timestamps." },
      { slot: "infobox-layout", name: "Classic Infobox", description: "Table-like facts panel that mirrors traditional wiki reading patterns." },
      { slot: "editor-panel", name: "Quick Edit Panel", description: "Editor-adjacent shortcuts for status, category, tags, and article actions." },
    ],
  },
  {
    ...registryMetadata({ id: "docs-portal-components", kind: "component-pack" }),
    id: "docs-portal-components",
    kind: "component-pack",
    name: "Docs Portal Components",
    description: "Documentation portal pack with version badges, sidebar section cards, page status, and last-reviewed metadata.",
    author: "Arkivel",
    compatibility: ">=4.78.1",
    status: "built-in",
    tags: ["docs", "portal", "versioned", "support"],
    recommendedLayout: "docs-portal",
    slots: ["article-card", "article-header", "metadata-panel", "homepage-section", "search-result", "space-navigation"],
    components: [
      { slot: "article-header", name: "Version Badge Header", description: "Docs title treatment with version, page status, and last-reviewed indicators." },
      { slot: "space-navigation", name: "Sidebar Section Cards", description: "Section-oriented navigation cards for docs portal category trees." },
      { slot: "metadata-panel", name: "Docs Review Metadata", description: "Last-reviewed, owner, version, and support-state metadata summary." },
      { slot: "search-result", name: "Docs Search Result", description: "Result row tuned for version, status, and matched docs section context." },
    ],
  },
  {
    ...registryMetadata({ id: "team-knowledge-base-components", kind: "component-pack" }),
    id: "team-knowledge-base-components",
    kind: "component-pack",
    name: "Team Knowledge Base Components",
    description: "Team handbook pack with owners, review dates, teams, escalation paths, and operational handbook widgets.",
    author: "Arkivel",
    compatibility: ">=4.78.1",
    status: "built-in",
    tags: ["team", "handbook", "owners", "operations"],
    recommendedLayout: "team-knowledge-base",
    slots: ["article-card", "article-header", "metadata-panel", "dashboard-widget", "homepage-section", "admin-summary"],
    components: [
      { slot: "article-header", name: "Owner Header", description: "Article header with owner, team, review date, and escalation metadata." },
      { slot: "metadata-panel", name: "Team Metadata Panel", description: "Operational metadata for team, owner, escalation path, and review cadence." },
      { slot: "dashboard-widget", name: "Handbook Widget", description: "Dashboard card for stale SOPs, owner gaps, and onboarding-critical articles." },
      { slot: "admin-summary", name: "Team Health Summary", description: "Admin summary for review obligations and handbook governance health." },
    ],
  },
  {
    ...registryMetadata({ id: "worldbuilding-atlas-components", kind: "component-pack" }),
    id: "worldbuilding-atlas-components",
    kind: "component-pack",
    name: "Worldbuilding Atlas Components",
    description: "Atlas pack with canon badges, region metadata, timeline cards, relation panels, and lore infoboxes.",
    author: "Arkivel",
    compatibility: ">=4.78.1",
    status: "built-in",
    tags: ["worldbuilding", "atlas", "canon", "timeline"],
    recommendedLayout: "worldbuilding-atlas",
    slots: ["article-card", "article-header", "metadata-panel", "infobox-layout", "homepage-section", "space-navigation"],
    components: [
      { slot: "article-header", name: "Canon Badge Header", description: "Lore header with canon status, continuity scope, and location context." },
      { slot: "metadata-panel", name: "Region Metadata Panel", description: "Region, faction, era, and continuity metadata for atlas articles." },
      { slot: "homepage-section", name: "Timeline Cards", description: "Homepage module for era cards, active arcs, and world events." },
      { slot: "infobox-layout", name: "Lore Infobox", description: "Worldbuilding facts panel for characters, places, factions, and artifacts." },
    ],
  },
  {
    ...registryMetadata({ id: "research-notebook-components", kind: "component-pack" }),
    id: "research-notebook-components",
    kind: "component-pack",
    name: "Research Notebook Components",
    description: "Research notebook pack with citation panels, evidence confidence, experiment logs, and bibliography widgets.",
    author: "Arkivel",
    compatibility: ">=4.78.1",
    status: "built-in",
    tags: ["research", "citations", "evidence", "experiments"],
    recommendedLayout: "research-notebook",
    slots: ["article-card", "article-header", "metadata-panel", "dashboard-widget", "infobox-layout", "search-result"],
    components: [
      { slot: "metadata-panel", name: "Citation Panel", description: "Citation, source, confidence, and evidence-state metadata for research notes." },
      { slot: "article-header", name: "Evidence Confidence Header", description: "Header treatment for confidence, review state, and experiment lineage." },
      { slot: "infobox-layout", name: "Experiment Log", description: "Structured experiment facts, methods, observations, and result summaries." },
      { slot: "dashboard-widget", name: "Bibliography Widget", description: "Dashboard card for sources, open claims, unreviewed citations, and evidence gaps." },
    ],
  },
];

export const pluginManifests: PluginManifest[] = [
  {
    ...registryMetadata({ id: "web-clipper-plugin", kind: "plugin", version: "0.1.0" }),
    id: "web-clipper-plugin",
    kind: "plugin",
    name: "Web Clipper Plugin",
    description: "Package the bookmarklet and browser clipper workflow as an installable extension point.",
    author: "Arkivel",
    compatibility: "future",
    status: "planned",
    tags: ["capture", "import", "browser"],
    permissions: ["article:create", "asset:read"],
    routes: ["/bookmarklet", "/clipper-extension"],
    settings: ["baseUrl", "defaultCategoryId"],
    widgets: ["capture-button"],
    hooks: ["article.beforeCreate", "article.afterCreate"],
  },
];

export const themePacks: ThemePack[] = [
  {
    ...registryMetadata({ id: "forest-theme-pack", kind: "theme-pack" }),
    id: "forest-theme-pack",
    kind: "theme-pack",
    name: "Forest Theme Pack",
    description: "Exportable sample pack for the built-in Forest color theme.",
    author: "Arkivel",
    compatibility: ">=4.75.0",
    status: "built-in",
    tags: ["theme", "forest", "green"],
    tokens: {
      "--color-accent": "#26734d",
      "--color-background": "#f5f8f3",
      "--color-surface": "#ffffff",
      "--color-foreground": "#1f2d24",
    },
  },
];

export const templatePacks: TemplatePack[] = [
  {
    ...registryMetadata({ id: "starter-space-template-pack", kind: "template-pack" }),
    id: "starter-space-template-pack",
    kind: "template-pack",
    name: "Starter Space Template Pack",
    description: "Preview-safe starter spaces for personal, docs, team, worldbuilding, research, reading, project, and public documentation use cases.",
    author: "Arkivel",
    compatibility: ">=4.91.0",
    status: "built-in",
    tags: ["templates", "starter-spaces", "spaces"],
    articleTemplatePreview: ["Home", "Getting Started", "Team Handbook", "Research Question"],
    categoryTreePreview: ["Library", "Docs", "Handbook", "Research"],
    compatibilityNotes: ["Requires the v1 space-template contract and preview-only import flow."],
    includedSchema: ["categoryTree", "articleTemplates", "metadataSchema", "infoboxFields", "navigation", "dashboard"],
    includedTemplateIds: [
      "personal-wiki",
      "product-docs",
      "team-handbook",
      "worldbuilding-bible",
      "research-notebook",
      "reading-archive",
      "project-knowledge-base",
      "public-documentation",
    ],
  },
];

export const marketplaceItems = [
  ...stylePresets,
  ...colorThemePresets,
  ...layoutPresets,
  ...componentPacks,
  ...pluginManifests,
  ...themePacks,
  ...templatePacks,
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

function isMarketplaceItemKind(value: unknown): value is MarketplaceItemKind {
  return SUPPORTED_MARKETPLACE_KINDS.includes(value as MarketplaceItemKind);
}

function isMarketplaceStatus(value: unknown): value is MarketplaceItemStatus {
  return (
    value === "built-in" ||
    value === "planned" ||
    value === "experimental" ||
    value === "local-only" ||
    value === "deprecated" ||
    value === "blocked"
  );
}

function isMarketplaceLicense(value: unknown): value is MarketplaceItemLicense {
  return SUPPORTED_MARKETPLACE_LICENSES.includes(value as MarketplaceItemLicense);
}

function hasChecksum(value: unknown): value is string {
  return typeof value === "string" && /^(local-fnv1a-[a-f0-9]{8}|sha256-[a-f0-9]{8,64})$/.test(value);
}

function parseVersion(version: string) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])] as const;
}

function compareVersions(left: readonly [number, number, number], right: readonly [number, number, number]) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] > right[index]) return 1;
    if (left[index] < right[index]) return -1;
  }
  return 0;
}

export function isMarketplaceCompatibilitySupported(
  compatibility: string,
  currentVersion = packageJson.version,
) {
  if (compatibility === "future") return true;
  const current = parseVersion(currentVersion);
  if (!current) return false;

  if (compatibility.startsWith(">=")) {
    const minimum = parseVersion(compatibility.slice(2).trim());
    return minimum ? compareVersions(current, minimum) >= 0 : false;
  }

  if (compatibility.startsWith("^")) {
    const minimum = parseVersion(compatibility.slice(1).trim());
    return minimum ? current[0] === minimum[0] && compareVersions(current, minimum) >= 0 : false;
  }

  const exact = parseVersion(compatibility);
  return exact ? compareVersions(current, exact) === 0 : false;
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
  const issues: MarketplaceValidationIssue[] = [];
  const ids = new Set<string>();
  const kinds = new Set<MarketplaceItemKind>();

  function addIssue(issue: MarketplaceValidationIssue) {
    issues.push(issue);
  }

  for (const [index, item] of items.entries()) {
    const itemId = hasString(item.id) ? item.id : `item-${index}`;
    const itemKind = isMarketplaceItemKind(item.kind) ? item.kind : undefined;
    if (itemKind) kinds.add(itemKind);

    if (!hasString(item.id)) {
      addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} is missing id`, severity: "error" });
    } else if (ids.has(item.id)) {
      addIssue({ code: "duplicate-id", itemId, kind: item.kind, message: `duplicate marketplace id: ${item.id}`, severity: "error" });
    }
    if (hasString(item.id)) ids.add(item.id);

    if (!itemKind) {
      addIssue({ code: "unsupported-kind", itemId, kind: String(item.kind), message: `${itemId} uses unsupported kind: ${String(item.kind)}`, severity: "error" });
    }
    if (!hasString(item.name)) addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} is missing a name`, severity: "error" });
    if (!hasString(item.description)) addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} is missing a description`, severity: "error" });
    if (!hasString(item.author)) addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} is missing author`, severity: "error" });
    if (!hasString(item.version)) addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} is missing version`, severity: "error" });
    if (!hasString(item.compatibility)) {
      addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} is missing compatibility`, severity: "error" });
    } else if (!isMarketplaceCompatibilitySupported(item.compatibility)) {
      addIssue({ code: "incompatible-version", itemId, kind: item.kind, message: `${itemId} is not compatible with Arkivel ${packageJson.version}`, severity: "error" });
    } else if (item.compatibility === "future" && item.status !== "planned") {
      addIssue({ code: "incompatible-version", itemId, kind: item.kind, message: `${itemId} uses future compatibility but is not planned`, severity: "error" });
    }
    if (!isMarketplaceStatus(item.status)) {
      addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} has an invalid status`, severity: "error" });
    }
    if (!isMarketplaceLicense(item.license)) {
      addIssue({ code: "invalid-license", itemId, kind: item.kind, message: `${itemId} uses unsupported license: ${String(item.license)}`, severity: "error" });
    }
    if (!Array.isArray(item.tags) || item.tags.length === 0) {
      addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} must include tags`, severity: "error" });
    }
    if (!Array.isArray(item.screenshots) || item.screenshots.length === 0 || !item.screenshots.every((path) => hasString(path) && path.startsWith("/"))) {
      addIssue({ code: "missing-screenshot", itemId, kind: item.kind, message: `${itemId} must include at least one local screenshot path`, severity: "error" });
    }
    if (!isRecord(item.checksums) || !hasChecksum(item.checksums.manifest)) {
      addIssue({ code: "missing-checksum", itemId, kind: item.kind, message: `${itemId} must include a manifest checksum`, severity: "error" });
    }
    if (!isRecord(item.source) || !hasString(item.source.path) || item.source.remote !== false) {
      addIssue({ code: "invalid-source", itemId, kind: item.kind, message: `${itemId} must use a local non-remote source`, severity: "error" });
    }
    if (item.kind === "plugin") {
      const permissions = (item as Partial<PluginManifest>).permissions;
      if (!hasStringArray(permissions)) {
        addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} must declare plugin permissions`, severity: "error" });
      } else {
        for (const permission of permissions) {
          if (
            permission.includes("*") ||
            permission === "admin:all" ||
            permission.startsWith("system:") ||
            permission.startsWith("shell:") ||
            permission.startsWith("filesystem:")
          ) {
            addIssue({ code: "unsafe-permission", itemId, kind: item.kind, message: `${itemId} uses unsafe permission: ${permission}`, severity: "error" });
          }
        }
      }
    }
    if (item.kind === "component-pack") {
      const slots = (item as Partial<ComponentPack>).slots;
      if (!hasStringArray(slots)) {
        addIssue({ code: "missing-field", itemId, kind: item.kind, message: `${itemId} must declare component slots`, severity: "error" });
      } else {
        for (const slot of slots) {
          if (!isComponentSlotId(slot)) {
            addIssue({ code: "unsupported-kind", itemId, kind: item.kind, message: `${itemId} uses unsupported component slot: ${slot}`, severity: "error" });
          }
        }
      }
    }
  }

  for (const kind of SUPPORTED_MARKETPLACE_KINDS) {
    if (!kinds.has(kind)) {
      addIssue({ code: "missing-required-kind", kind, message: `missing marketplace kind: ${kind}`, severity: "error" });
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error").map((issue) => issue.message);
  const warnings = issues.filter((issue) => issue.severity === "warning").map((issue) => issue.message);
  const summary = createMarketplaceValidationSummary(items, issues);

  return { errors, issues, summary, valid: errors.length === 0, warnings };
}

export function createMarketplaceValidationSummary(
  items: MarketplaceItem[],
  issues: MarketplaceValidationIssue[],
): MarketplaceValidationSummary {
  const kindCounts = Object.fromEntries(
    SUPPORTED_MARKETPLACE_KINDS.map((kind) => [kind, items.filter((item) => item.kind === kind).length]),
  ) as Record<MarketplaceItemKind, number>;
  const statusCounts = {
    "built-in": items.filter((item) => item.status === "built-in").length,
    blocked: items.filter((item) => item.status === "blocked").length,
    deprecated: items.filter((item) => item.status === "deprecated").length,
    experimental: items.filter((item) => item.status === "experimental").length,
    "local-only": items.filter((item) => item.status === "local-only").length,
    planned: items.filter((item) => item.status === "planned").length,
  };
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    errorCount,
    itemCount: items.length,
    kindCounts,
    schemaVersion: MARKETPLACE_REGISTRY_SCHEMA_VERSION,
    source: marketplaceCatalogSource,
    status: errorCount > 0 ? "errors" : warningCount > 0 ? "warnings" : "healthy",
    statusCounts,
    version: packageJson.version,
    warningCount,
  };
}

export function createMarketplaceRegistry(items: MarketplaceItem[] = marketplaceItems): MarketplaceRegistry {
  return {
    contract: marketplaceRegistryContract,
    id: MARKETPLACE_REGISTRY_ID,
    items,
    schemaVersion: MARKETPLACE_REGISTRY_SCHEMA_VERSION,
    source: marketplaceCatalogSource,
    supportedKinds: SUPPORTED_MARKETPLACE_KINDS,
    supportedLicenses: SUPPORTED_MARKETPLACE_LICENSES,
    validation: validateMarketplaceCatalog(items),
    version: packageJson.version,
  };
}

export const themePackSchema = {
  id: "Stable machine-readable pack id",
  name: "Human-readable pack name",
  kind: "theme-pack",
  version: "Pack version, for example 1.0.0",
  compatibility: "Arkivel version range, for example >=4.75.0",
  author: "Pack author",
  license: "Open-source license identifier, for example MIT",
  source: "Local registry source metadata",
  checksums: "Manifest and optional screenshot checksums",
  screenshots: ["Local screenshot path"],
  tokens: {
    "--color-accent": "CSS color token value",
  },
};

export const perSpaceCustomizationContract = {
  source: "category",
  status: "persisted",
  inherits: ["global environment customization", "parent category", "category", "article override"],
  fields: [
    "styleId",
    "colorThemeId",
    "layoutId",
    "componentPackId",
    "templatePackId",
    "metadataSchemaId",
    "navigationMode",
  ],
  precedence: ["article override", "category", "parent category", "global environment customization"],
  persistence: "SpaceCustomization and ArticleCustomizationOverride database records in v4.79.0",
};

export const marketplaceRegistry = createMarketplaceRegistry();
