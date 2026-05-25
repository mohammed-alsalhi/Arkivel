import {
  customization,
  type ArkivelCustomization,
} from "./customization";
import {
  colorThemePresets,
  componentPacks,
  layoutPresets,
  stylePresets,
} from "./marketplace";

export const SPACE_NAVIGATION_MODES = [
  "inherit",
  "sidebar-tree",
  "section-cards",
  "atlas-map",
  "research-streams",
  "hidden",
] as const;

export type SpaceNavigationMode = (typeof SPACE_NAVIGATION_MODES)[number];
export type SpaceCustomizationSource = "global" | "parent-space" | "space" | "article";

export type SpaceCustomizationInput = {
  colorThemeId?: unknown;
  componentPackId?: unknown;
  layoutId?: unknown;
  metadataSchemaId?: unknown;
  navigationMode?: unknown;
  privateDraftConfig?: unknown;
  styleId?: unknown;
  templatePackId?: unknown;
};

export type SpaceCustomizationValues = {
  colorThemeId: string | null;
  componentPackId: string | null;
  layoutId: string | null;
  metadataSchemaId: string | null;
  navigationMode: SpaceNavigationMode | null;
  privateDraftConfig?: unknown;
  styleId: string | null;
  templatePackId: string | null;
};

export type PublicSpaceCustomization = Omit<SpaceCustomizationValues, "privateDraftConfig"> & {
  inheritedFrom?: string | null;
  source: SpaceCustomizationSource;
};

export type SpaceCustomizationValidation = {
  errors: string[];
  values: SpaceCustomizationValues;
  valid: boolean;
};

export type ResolvedSpaceCustomization = {
  chain: PublicSpaceCustomization[];
  effective: PublicSpaceCustomization;
  privateDraftConfigHidden: true;
  sources: Record<keyof Omit<SpaceCustomizationValues, "privateDraftConfig">, SpaceCustomizationSource>;
};

type CustomizationNode = Omit<Partial<SpaceCustomizationValues>, "navigationMode"> & {
  categoryId?: string | null;
  id?: string;
  label?: string | null;
  navigationMode?: SpaceNavigationMode | string | null;
  parentId?: string | null;
};

const knownStyleIds = new Set(stylePresets.map((preset) => preset.id));
const knownColorThemeIds = new Set(colorThemePresets.map((preset) => preset.id));
const knownLayoutIds = new Set(layoutPresets.flatMap((preset) => [preset.id, preset.envValue]));
const knownComponentPackIds = new Set(componentPacks.map((pack) => pack.id));

export function validateSpaceCustomizationInput(input: SpaceCustomizationInput): SpaceCustomizationValidation {
  const errors: string[] = [];
  const values: SpaceCustomizationValues = {
    colorThemeId: optionalString(input.colorThemeId),
    componentPackId: optionalString(input.componentPackId),
    layoutId: optionalString(input.layoutId),
    metadataSchemaId: optionalString(input.metadataSchemaId),
    navigationMode: optionalNavigationMode(input.navigationMode),
    privateDraftConfig: input.privateDraftConfig,
    styleId: optionalString(input.styleId),
    templatePackId: optionalString(input.templatePackId),
  };

  if (values.styleId && !knownStyleIds.has(values.styleId)) errors.push(`unsupported styleId: ${values.styleId}`);
  if (values.colorThemeId && !knownColorThemeIds.has(values.colorThemeId)) errors.push(`unsupported colorThemeId: ${values.colorThemeId}`);
  if (values.layoutId && !knownLayoutIds.has(values.layoutId)) errors.push(`unsupported layoutId: ${values.layoutId}`);
  if (values.componentPackId && !knownComponentPackIds.has(values.componentPackId)) errors.push(`unsupported componentPackId: ${values.componentPackId}`);
  if (input.navigationMode !== undefined && input.navigationMode !== null && input.navigationMode !== "" && !values.navigationMode) {
    errors.push(`unsupported navigationMode: ${String(input.navigationMode)}`);
  }
  if (values.templatePackId && !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(values.templatePackId)) {
    errors.push("templatePackId must use lowercase kebab-case");
  }
  if (values.metadataSchemaId && !/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/i.test(values.metadataSchemaId)) {
    errors.push("metadataSchemaId must use letters, numbers, dots, underscores, or hyphens");
  }
  if (
    input.privateDraftConfig !== undefined &&
    input.privateDraftConfig !== null &&
    (typeof input.privateDraftConfig !== "object" || Array.isArray(input.privateDraftConfig))
  ) {
    errors.push("privateDraftConfig must be an object");
  }

  return { errors, valid: errors.length === 0, values };
}

export function toPublicSpaceCustomization(
  values: CustomizationNode | null | undefined,
  source: SpaceCustomizationSource,
  inheritedFrom?: string | null,
): PublicSpaceCustomization {
  return {
    colorThemeId: values?.colorThemeId ?? null,
    componentPackId: values?.componentPackId ?? null,
    inheritedFrom: inheritedFrom ?? null,
    layoutId: values?.layoutId ?? null,
    metadataSchemaId: values?.metadataSchemaId ?? null,
    navigationMode: optionalNavigationMode(values?.navigationMode) ?? null,
    source,
    styleId: values?.styleId ?? null,
    templatePackId: values?.templatePackId ?? null,
  };
}

export function resolveSpaceCustomizationInheritance({
  articleOverride,
  categoryChain,
  globalDefaults,
}: {
  articleOverride?: CustomizationNode | null;
  categoryChain: CustomizationNode[];
  globalDefaults: SpaceCustomizationValues;
}): ResolvedSpaceCustomization {
  let resolved: SpaceCustomizationValues = { ...globalDefaults };
  let source: SpaceCustomizationSource = "global";
  const chain: PublicSpaceCustomization[] = [toPublicSpaceCustomization(globalDefaults, "global", "environment")];
  const sources = Object.fromEntries(
    valueKeys.map((key) => [key, "global"]),
  ) as ResolvedSpaceCustomization["sources"];

  for (const node of categoryChain) {
    const next = mergeCustomization(resolved, node);
    const nodeSource: SpaceCustomizationSource = node === categoryChain.at(-1) ? "space" : "parent-space";
    for (const key of next.changedKeys) sources[key] = nodeSource;
    if (next.changed) source = nodeSource;
    resolved = next.values;
    chain.push(toPublicSpaceCustomization(node, nodeSource, node.label ?? node.id ?? node.categoryId ?? null));
  }

  if (articleOverride) {
    const next = mergeCustomization(resolved, articleOverride);
    for (const key of next.changedKeys) sources[key] = "article";
    if (next.changed) source = "article";
    resolved = next.values;
    chain.push(toPublicSpaceCustomization(articleOverride, "article", articleOverride.label ?? articleOverride.id ?? null));
  }

  return {
    chain,
    effective: toPublicSpaceCustomization(resolved, source),
    privateDraftConfigHidden: true,
    sources,
  };
}

export function defaultGlobalSpaceCustomization(globalCustomization: ArkivelCustomization = customization): SpaceCustomizationValues {
  return {
    colorThemeId: globalCustomization.style.colorThemeId || colorThemePresets[0].id,
    componentPackId: componentPacks[0].id,
    layoutId: globalCustomization.style.layoutId || layoutPresets[0].envValue,
    metadataSchemaId: null,
    navigationMode: "sidebar-tree",
    styleId: globalCustomization.style.id || stylePresets[0].id,
    templatePackId: null,
  };
}

export const spaceCustomizationContract = {
  id: "arkivel.space-customization.v1",
  status: "persisted",
  fields: [
    "styleId",
    "colorThemeId",
    "layoutId",
    "componentPackId",
    "templatePackId",
    "navigationMode",
    "metadataSchemaId",
    "privateDraftConfig",
  ],
  privateFields: ["privateDraftConfig"],
  scopes: ["global environment", "parent category", "category", "article override"],
  precedence: ["global", "parent-space", "space", "article"],
  publicShape: "GET endpoints redact privateDraftConfig for unauthenticated and non-admin callers.",
  updateEndpoints: [
    "PUT /api/categories/:id/customization",
    "PUT /api/articles/:id/customization",
  ],
};

export const spaceCustomizationMigrationGuide = {
  migrate:
    "Upgrade to v4.79.0, run `npx prisma generate`, run `npx prisma db push`, delete `.next/`, then restart Arkivel. Existing categories and articles inherit the global environment customization until an admin saves overrides.",
  rollback:
    "Before rollback, clear rows from ArticleCustomizationOverride and SpaceCustomization or keep a database backup. Then restore the previous app version, run `npx prisma generate`, run `npx prisma db push`, delete `.next/`, and restart.",
};

const valueKeys = [
  "colorThemeId",
  "componentPackId",
  "layoutId",
  "metadataSchemaId",
  "navigationMode",
  "styleId",
  "templatePackId",
] as const;

function mergeCustomization(base: SpaceCustomizationValues, override: CustomizationNode) {
  let changed = false;
  const changedKeys: (typeof valueKeys)[number][] = [];
  const values = { ...base };

  for (const key of valueKeys) {
    const value = key === "navigationMode" ? optionalNavigationMode(override[key]) : override[key];
    if (value !== undefined && value !== null) {
      values[key] = value as never;
      changed = true;
      changedKeys.push(key);
    }
  }

  return { changed, changedKeys, values };
}

function optionalString(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "string" ? value.trim() || null : String(value);
}

function optionalNavigationMode(value: unknown): SpaceNavigationMode | null {
  if (value === undefined || value === null || value === "") return null;
  return SPACE_NAVIGATION_MODES.includes(value as SpaceNavigationMode) ? (value as SpaceNavigationMode) : null;
}
