export type CustomizationDraft = {
  appIcon: string;
  baseUrl: string;
  colorThemeId: string;
  description: string;
  discussionsEnabled: boolean;
  footerText: string;
  layoutId: string;
  logo: string;
  logoMark: string;
  mapEnabled: boolean;
  name: string;
  registrationEnabled: boolean;
  styleId: string;
  tagline: string;
  welcomeText: string;
};

export type SavedCustomizationDraft = {
  id: string;
  name: string;
  updatedAt: string;
  values: CustomizationDraft;
};

export type CustomizationDraftPreset = {
  description: string;
  id: string;
  name: string;
  values: Partial<CustomizationDraft>;
};

export type CustomizationDraftDiffRow = {
  activeValue: string;
  draftValue: string;
  field: keyof CustomizationDraft;
  label: string;
};

export const CUSTOMIZATION_DRAFT_STORAGE_KEY = "arkivel.customizationDrafts.v1";

export const DEFAULT_CUSTOMIZATION_DRAFT: CustomizationDraft = {
  appIcon: "/brand/arkivel-icon-512.png",
  baseUrl: "http://localhost:3000",
  colorThemeId: "standard",
  description: "A powerful open-source knowledge platform for individuals and teams",
  discussionsEnabled: true,
  footerText: "Content is available under Creative Commons Attribution.",
  layoutId: "classic-wiki",
  logo: "/brand/arkivel-logo.png",
  logoMark: "/brand/arkivel-logo.svg",
  mapEnabled: false,
  name: "Arkivel",
  registrationEnabled: true,
  styleId: "classic-wiki",
  tagline: "The self-hosted knowledge platform",
  welcomeText:
    "Welcome to Arkivel. Create articles, organize knowledge, and build your own encyclopedia -- on infrastructure you own.",
};

export const CUSTOMIZATION_DRAFT_PRESETS: CustomizationDraftPreset[] = [
  {
    id: "personal-wiki",
    name: "Personal Wiki",
    description: "A private knowledge garden for notes, reading, projects, and evergreen references.",
    values: {
      colorThemeId: "ember",
      description: "A private wiki for notes, projects, references, and long-term thinking.",
      footerText: "Private knowledge archive.",
      layoutId: "classic-wiki",
      name: "Personal Wiki",
      registrationEnabled: false,
      tagline: "Notes, references, and projects in one place",
      welcomeText: "Capture ideas, connect notes, and keep useful knowledge close.",
    },
  },
  {
    id: "team-handbook",
    name: "Team Handbook",
    description: "An internal team knowledge base for policies, onboarding, owners, and review cycles.",
    values: {
      colorThemeId: "forest",
      description: "A team handbook for policies, onboarding, operating notes, and reviewed knowledge.",
      discussionsEnabled: true,
      layoutId: "team-knowledge-base",
      name: "Team Handbook",
      registrationEnabled: false,
      tagline: "Shared operating knowledge for the team",
      welcomeText: "Find policies, owners, onboarding paths, and reviewed team knowledge.",
    },
  },
  {
    id: "docs-portal",
    name: "Docs Portal",
    description: "A public or private documentation portal for product, support, and developer docs.",
    values: {
      colorThemeId: "standard",
      description: "A documentation portal for product guides, API notes, and support references.",
      layoutId: "docs-portal",
      name: "Docs Portal",
      registrationEnabled: false,
      tagline: "Product and support documentation",
      welcomeText: "Browse guides, references, changelogs, and implementation notes.",
    },
  },
  {
    id: "worldbuilding-atlas",
    name: "Worldbuilding Atlas",
    description: "A canon wiki for worlds, maps, factions, characters, timelines, and lore.",
    values: {
      colorThemeId: "ember",
      description: "A living canon atlas for places, factions, characters, timelines, and lore.",
      layoutId: "worldbuilding-atlas",
      mapEnabled: true,
      name: "Worldbuilding Atlas",
      registrationEnabled: false,
      styleId: "atlas-modern",
      tagline: "Canon, maps, timelines, and lore",
      welcomeText: "Explore the world, follow story threads, and keep continuity intact.",
    },
  },
  {
    id: "research-notebook",
    name: "Research Notebook",
    description: "A research workspace for citations, evidence, claims, experiments, and synthesis.",
    values: {
      colorThemeId: "forest",
      description: "A research notebook for citations, evidence, experiments, claims, and synthesis.",
      layoutId: "research-notebook",
      name: "Research Notebook",
      registrationEnabled: false,
      tagline: "Evidence, notes, and synthesis",
      welcomeText: "Collect sources, track claims, compare evidence, and turn research into durable knowledge.",
    },
  },
  {
    id: "read-only-archive",
    name: "Read-Only Archive",
    description: "A quiet archive setup for published content, preserved references, and stable browsing.",
    values: {
      colorThemeId: "standard",
      description: "A read-only archive for preserved knowledge, references, and published material.",
      discussionsEnabled: false,
      layoutId: "classic-wiki",
      name: "Archive",
      registrationEnabled: false,
      tagline: "Preserved knowledge and references",
      welcomeText: "Browse the archive, follow references, and preserve durable context.",
    },
  },
];

const draftLabels: Record<keyof CustomizationDraft, string> = {
  appIcon: "App icon",
  baseUrl: "Base URL",
  colorThemeId: "Color theme",
  description: "Description",
  discussionsEnabled: "Discussions",
  footerText: "Footer text",
  layoutId: "Layout",
  logo: "Full logo",
  logoMark: "Logo mark",
  mapEnabled: "Map enabled",
  name: "Site name",
  registrationEnabled: "Registration",
  styleId: "Style",
  tagline: "Tagline",
  welcomeText: "Welcome text",
};

function displayValue(value: string | boolean) {
  return typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : value;
}

function isCustomizationDraft(value: unknown): value is CustomizationDraft {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<CustomizationDraft>;
  return (
    typeof maybe.appIcon === "string" &&
    typeof maybe.baseUrl === "string" &&
    typeof maybe.colorThemeId === "string" &&
    typeof maybe.description === "string" &&
    typeof maybe.discussionsEnabled === "boolean" &&
    typeof maybe.footerText === "string" &&
    typeof maybe.layoutId === "string" &&
    typeof maybe.logo === "string" &&
    typeof maybe.logoMark === "string" &&
    typeof maybe.mapEnabled === "boolean" &&
    typeof maybe.name === "string" &&
    typeof maybe.registrationEnabled === "boolean" &&
    typeof maybe.styleId === "string" &&
    typeof maybe.tagline === "string" &&
    typeof maybe.welcomeText === "string"
  );
}

export function applyCustomizationDraftPreset(base: CustomizationDraft, presetId: string) {
  const preset = CUSTOMIZATION_DRAFT_PRESETS.find((item) => item.id === presetId);
  return preset ? { ...base, ...preset.values } : base;
}

export function createCustomizationDraftDiff(active: CustomizationDraft, draft: CustomizationDraft) {
  return (Object.keys(draftLabels) as (keyof CustomizationDraft)[])
    .filter((field) => String(active[field]) !== String(draft[field]))
    .map((field) => ({
      activeValue: displayValue(active[field]),
      draftValue: displayValue(draft[field]),
      field,
      label: draftLabels[field],
    })) satisfies CustomizationDraftDiffRow[];
}

export function createSavedCustomizationDraft(
  name: string,
  values: CustomizationDraft,
  now = new Date().toISOString(),
  id = `draft-${Date.now()}`,
): SavedCustomizationDraft {
  return {
    id,
    name: name.trim() || "Untitled draft",
    updatedAt: now,
    values,
  };
}

function isSavedCustomizationDraft(value: unknown): value is SavedCustomizationDraft {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<SavedCustomizationDraft>;
  return (
    typeof maybe.id === "string" &&
    typeof maybe.name === "string" &&
    typeof maybe.updatedAt === "string" &&
    isCustomizationDraft(maybe.values)
  );
}

export function parseSavedCustomizationDrafts(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isSavedCustomizationDraft) : [];
  } catch {
    return [];
  }
}
