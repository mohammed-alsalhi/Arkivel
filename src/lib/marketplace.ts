export type MarketplaceItemKind = "style" | "color-theme" | "component-pack" | "plugin";
export type MarketplaceItemStatus = "built-in" | "planned" | "experimental";

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

export type StylePreset = MarketplaceItem & {
  kind: "style";
  themeAttribute: string;
};

export type ColorThemePreset = MarketplaceItem & {
  kind: "color-theme";
  themeAttribute: string;
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

export const marketplaceItems = [
  ...stylePresets,
  ...colorThemePresets,
  {
    id: "operations-component-pack",
    kind: "component-pack",
    name: "Operations Component Pack",
    description: "Reusable dashboard and admin components for teams using Arkivel as an internal knowledge operations hub.",
    author: "Arkivel",
    compatibility: "future",
    status: "planned",
    tags: ["dashboard", "admin", "operations"],
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
  },
  {
    id: "web-clipper-plugin",
    kind: "plugin",
    name: "Web Clipper Plugin",
    description: "Package the bookmarklet and browser clipper workflow as an installable extension point.",
    author: "Arkivel",
    compatibility: "future",
    status: "planned",
    tags: ["capture", "import", "browser"],
  },
] satisfies MarketplaceItem[];

export function resolveStylePreset(styleId: string | undefined): StylePreset {
  return stylePresets.find((style) => style.id === styleId) ?? stylePresets[0];
}

export function resolveColorThemePreset(themeId: string | undefined): ColorThemePreset {
  return colorThemePresets.find((theme) => theme.id === themeId) ?? colorThemePresets[0];
}
