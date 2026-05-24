import packageJson from "../../package.json";
import {
  resolveColorThemePreset,
  resolveLayoutPreset,
  resolveStylePreset,
  type ColorThemePreset,
  type LayoutPreset,
  type StylePreset,
} from "./marketplace";

type Env = Record<string, string | undefined>;

export type CustomizationSection = "brand" | "features" | "limits" | "map" | "integrations" | "style";

export type CustomizationOption = {
  defaultValue: string;
  description: string;
  env: string;
  section: CustomizationSection;
};

export type BrandCustomization = {
  appIcon: string;
  description: string;
  footerText: string;
  logo: string;
  logoMark: string;
  name: string;
  tagline: string;
  welcomeText: string;
};

export type StyleCustomization = {
  colorTheme: ColorThemePreset;
  colorThemeId: string;
  id: string;
  layout: LayoutPreset;
  layoutId: string;
  preset: StylePreset;
};

export type FeatureCustomization = {
  discussionsEnabled: boolean;
  registrationEnabled: boolean;
};

export type LimitCustomization = {
  articlesPerPage: number;
  defaultLocale: string;
  maxUploadSize: number;
};

export type MapCustomization = {
  enabled: boolean;
  image: string;
  label: string;
};

export type IntegrationCustomization = {
  baseUrl: string;
};

export type ArkivelCustomization = {
  brand: BrandCustomization;
  features: FeatureCustomization;
  integrations: IntegrationCustomization;
  limits: LimitCustomization;
  map: MapCustomization;
  style: StyleCustomization;
  version: string;
};

export const customizationOptions = [
  {
    env: "NEXT_PUBLIC_ARKIVEL_NAME",
    section: "brand",
    defaultValue: "Arkivel",
    description: "Site name shown in app chrome, metadata, manifest, feeds, and exports.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_TAGLINE",
    section: "brand",
    defaultValue: "The self-hosted knowledge platform",
    description: "Short app tagline shown in the top bar.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_DESCRIPTION",
    section: "brand",
    defaultValue: "A powerful open-source knowledge platform for individuals and teams",
    description: "SEO, Open Graph, feed, and manifest description.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_WELCOME_TEXT",
    section: "brand",
    defaultValue:
      "Welcome to Arkivel. Create articles, organize knowledge, and build your own encyclopedia -- on infrastructure you own.",
    description: "Homepage welcome copy for self-hosted instances.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_FOOTER_TEXT",
    section: "brand",
    defaultValue: "Content is available under Creative Commons Attribution.",
    description: "Footer text shown after the configured site name.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_LOGO",
    section: "brand",
    defaultValue: "/brand/arkivel-logo.png",
    description: "Square brand image used for metadata previews.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_LOGO_MARK",
    section: "brand",
    defaultValue: "/brand/arkivel-logo.svg",
    description: "Compact brand mark used in app navigation.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_APP_ICON",
    section: "brand",
    defaultValue: "/brand/arkivel-icon-512.png",
    description: "Installable app icon used by the web app manifest.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_STYLE",
    section: "style",
    defaultValue: "classic-wiki",
    description: "Built-in style preset id. Supported today: classic-wiki, atlas-modern.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_COLOR_THEME",
    section: "style",
    defaultValue: "standard",
    description: "Built-in color theme id. Supported today: standard, forest, ember.",
  },
  {
    env: "NEXT_PUBLIC_ARKIVEL_LAYOUT",
    section: "style",
    defaultValue: "classic-wiki",
    description:
      "Built-in layout preset id. Supported today: classic-wiki, docs-portal, team-knowledge-base, worldbuilding-atlas, research-notebook.",
  },
  {
    env: "NEXT_PUBLIC_MAP_ENABLED",
    section: "map",
    defaultValue: "false",
    description: "Enables the optional interactive map route and navigation item.",
  },
  {
    env: "NEXT_PUBLIC_MAP_LABEL",
    section: "map",
    defaultValue: "Map",
    description: "Navigation and heading label for the optional map feature.",
  },
  {
    env: "NEXT_PUBLIC_MAP_IMAGE",
    section: "map",
    defaultValue: "",
    description: "Map background image path or URL.",
  },
  {
    env: "NEXT_PUBLIC_DEFAULT_LOCALE",
    section: "limits",
    defaultValue: "en",
    description: "Default locale for content and language-aware UI.",
  },
  {
    env: "NEXT_PUBLIC_ARTICLES_PER_PAGE",
    section: "limits",
    defaultValue: "20",
    description: "Default page size for article listing surfaces.",
  },
  {
    env: "NEXT_PUBLIC_MAX_UPLOAD_SIZE",
    section: "limits",
    defaultValue: "5242880",
    description: "Maximum upload size in bytes.",
  },
  {
    env: "NEXT_PUBLIC_ENABLE_REGISTRATION",
    section: "features",
    defaultValue: "true",
    description: "Set to false to disable public registration.",
  },
  {
    env: "NEXT_PUBLIC_ENABLE_DISCUSSIONS",
    section: "features",
    defaultValue: "true",
    description: "Set to false to hide article discussion capabilities.",
  },
  {
    env: "NEXT_PUBLIC_BASE_URL",
    section: "integrations",
    defaultValue: "http://localhost:3000",
    description: "Canonical base URL for metadata, feeds, sitemaps, and share links.",
  },
] satisfies CustomizationOption[];

function read(env: Env, key: string, fallback: string) {
  const value = env[key]?.trim();
  return value || fallback;
}

function readCompat(env: Env, preferred: string, legacy: string, fallback: string) {
  return read(env, preferred, read(env, legacy, fallback));
}

function readBoolean(env: Env, key: string, fallback: boolean) {
  const value = env[key]?.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function readPositiveInteger(env: Env, key: string, fallback: number) {
  const value = Number.parseInt(env[key] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createCustomization(env: Env = process.env): ArkivelCustomization {
  const styleId = read(env, "NEXT_PUBLIC_ARKIVEL_STYLE", "classic-wiki");
  const stylePreset = resolveStylePreset(styleId);
  const colorThemeId = read(env, "NEXT_PUBLIC_ARKIVEL_COLOR_THEME", "standard");
  const colorTheme = resolveColorThemePreset(colorThemeId);
  const layoutId = read(env, "NEXT_PUBLIC_ARKIVEL_LAYOUT", "classic-wiki");
  const layout = resolveLayoutPreset(layoutId);

  return {
    version: packageJson.version,
    brand: {
      name: readCompat(env, "NEXT_PUBLIC_ARKIVEL_NAME", "NEXT_PUBLIC_WIKI_NAME", "Arkivel"),
      tagline: readCompat(
        env,
        "NEXT_PUBLIC_ARKIVEL_TAGLINE",
        "NEXT_PUBLIC_WIKI_TAGLINE",
        "The self-hosted knowledge platform",
      ),
      description: readCompat(
        env,
        "NEXT_PUBLIC_ARKIVEL_DESCRIPTION",
        "NEXT_PUBLIC_WIKI_DESCRIPTION",
        "A powerful open-source knowledge platform for individuals and teams",
      ),
      welcomeText: readCompat(
        env,
        "NEXT_PUBLIC_ARKIVEL_WELCOME_TEXT",
        "NEXT_PUBLIC_WIKI_WELCOME_TEXT",
        "Welcome to Arkivel. Create articles, organize knowledge, and build your own encyclopedia -- on infrastructure you own.",
      ),
      footerText: readCompat(
        env,
        "NEXT_PUBLIC_ARKIVEL_FOOTER_TEXT",
        "NEXT_PUBLIC_WIKI_FOOTER_TEXT",
        "Content is available under Creative Commons Attribution.",
      ),
      logo: read(env, "NEXT_PUBLIC_ARKIVEL_LOGO", "/brand/arkivel-logo.png"),
      logoMark: read(env, "NEXT_PUBLIC_ARKIVEL_LOGO_MARK", "/brand/arkivel-logo.svg"),
      appIcon: read(env, "NEXT_PUBLIC_ARKIVEL_APP_ICON", "/brand/arkivel-icon-512.png"),
    },
    features: {
      registrationEnabled: readBoolean(env, "NEXT_PUBLIC_ENABLE_REGISTRATION", true),
      discussionsEnabled: readBoolean(env, "NEXT_PUBLIC_ENABLE_DISCUSSIONS", true),
    },
    integrations: {
      baseUrl: read(env, "NEXT_PUBLIC_BASE_URL", "http://localhost:3000"),
    },
    limits: {
      defaultLocale: read(env, "NEXT_PUBLIC_DEFAULT_LOCALE", "en"),
      articlesPerPage: readPositiveInteger(env, "NEXT_PUBLIC_ARTICLES_PER_PAGE", 20),
      maxUploadSize: readPositiveInteger(env, "NEXT_PUBLIC_MAX_UPLOAD_SIZE", 5242880),
    },
    map: {
      enabled: readBoolean(env, "NEXT_PUBLIC_MAP_ENABLED", false),
      label: read(env, "NEXT_PUBLIC_MAP_LABEL", "Map"),
      image: read(env, "NEXT_PUBLIC_MAP_IMAGE", ""),
    },
    style: {
      id: stylePreset.id,
      preset: stylePreset,
      colorThemeId: colorTheme.id,
      colorTheme,
      layoutId: layout.id,
      layout,
    },
  };
}

export const customization = createCustomization();
