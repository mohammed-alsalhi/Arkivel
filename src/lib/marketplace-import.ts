import packageJson from "../../package.json";
import {
  SUPPORTED_MARKETPLACE_LICENSES,
  isMarketplaceCompatibilitySupported,
  themePacks,
  validatePluginManifest,
  validateThemePack,
  type MarketplaceItemLicense,
} from "./marketplace";

export const MARKETPLACE_IMPORT_SCHEMA_VERSION = "arkivel.marketplace.import.v1";
export const SUPPORTED_MARKETPLACE_IMPORT_KINDS = [
  "theme-pack",
  "layout-pack",
  "component-pack",
  "plugin",
] as const;

export type MarketplaceImportKind = (typeof SUPPORTED_MARKETPLACE_IMPORT_KINDS)[number];
export type MarketplaceImportStatus = "accepted-preview" | "blocked";

export type MarketplaceImportMetadata = {
  author?: string;
  compatibility?: string;
  id?: string;
  kind?: MarketplaceImportKind;
  license?: string;
  name?: string;
  schemaVersion?: string;
  version?: string;
};

export type MarketplaceTokenDiffStatus = "added" | "changed" | "removed" | "unchanged";

export type MarketplaceTokenDiff = {
  builtInValue?: string;
  importedValue?: string;
  status: MarketplaceTokenDiffStatus;
  token: string;
};

export type MarketplaceImportPreview = {
  compatibilityWarnings: string[];
  hooks: string[];
  metadata: MarketplaceImportMetadata;
  parsed: boolean;
  permissions: string[];
  previewOnly: true;
  rawKind?: string;
  requiredEnvVars: string[];
  requiredFiles: string[];
  routes: string[];
  securityErrors: string[];
  settings: string[];
  slots: string[];
  status: MarketplaceImportStatus;
  tokenDiff: MarketplaceTokenDiff[];
  validationErrors: string[];
  valid: boolean;
  widgets: string[];
};

const executableKeys = new Set([
  "bin",
  "code",
  "command",
  "commands",
  "entrypoint",
  "eval",
  "exec",
  "execute",
  "install",
  "main",
  "module",
  "postinstall",
  "script",
  "scripts",
]);

const requiredFilesByKind: Record<MarketplaceImportKind, string[]> = {
  "theme-pack": ["theme-pack.json", "tokens.json"],
  "layout-pack": ["layout-pack.json", "layout.css"],
  "component-pack": ["component-pack.json", "slots.json"],
  plugin: ["plugin.json"],
};

const requiredEnvVarsByKind: Record<MarketplaceImportKind, string[]> = {
  "theme-pack": ["NEXT_PUBLIC_ARKIVEL_COLOR_THEME"],
  "layout-pack": ["NEXT_PUBLIC_ARKIVEL_LAYOUT"],
  "component-pack": [],
  plugin: [],
};

export const marketplaceImportContract = {
  schemaVersion: MARKETPLACE_IMPORT_SCHEMA_VERSION,
  previewOnly: true,
  supportedKinds: SUPPORTED_MARKETPLACE_IMPORT_KINDS,
  requiredFields: ["schemaVersion", "id", "kind", "name", "version", "compatibility", "author", "license"],
  optionalFields: [
    "requiredFiles",
    "requiredEnvVars",
    "permissions",
    "routes",
    "settings",
    "slots",
    "widgets",
    "hooks",
    "tokens",
  ],
  blockedFields: ["scripts", "postinstall", "command", "exec", "eval", "code", "remote", "module", "main"],
  blockedValues: ["http://", "https://", "git+", "npm:", "javascript:", "../"],
};

export const marketplaceImportExamples = {
  "theme-pack": {
    schemaVersion: MARKETPLACE_IMPORT_SCHEMA_VERSION,
    id: "example-aurora-theme",
    kind: "theme-pack",
    name: "Example Aurora Theme",
    version: "1.0.0",
    compatibility: ">=4.77.1",
    author: "Example Author",
    license: "MIT",
    requiredFiles: ["theme-pack.json", "tokens.json", "preview.png"],
    requiredEnvVars: ["NEXT_PUBLIC_ARKIVEL_COLOR_THEME"],
    tokens: {
      "--color-accent": "#3b82f6",
      "--color-background": "#f8fafc",
      "--color-surface": "#ffffff",
      "--color-foreground": "#172033",
    },
  },
  "layout-pack": {
    schemaVersion: MARKETPLACE_IMPORT_SCHEMA_VERSION,
    id: "example-dossier-layout",
    kind: "layout-pack",
    name: "Example Dossier Layout",
    version: "1.0.0",
    compatibility: ">=4.77.1",
    author: "Example Author",
    license: "MIT",
    requiredFiles: ["layout-pack.json", "layout.css", "preview.png"],
    requiredEnvVars: ["NEXT_PUBLIC_ARKIVEL_LAYOUT"],
    slots: ["article-header", "metadata-panel", "right-rail"],
  },
  "component-pack": {
    schemaVersion: MARKETPLACE_IMPORT_SCHEMA_VERSION,
    id: "example-research-components",
    kind: "component-pack",
    name: "Example Research Components",
    version: "1.0.0",
    compatibility: ">=4.77.1",
    author: "Example Author",
    license: "MIT",
    requiredFiles: ["component-pack.json", "slots.json", "preview.png"],
    requiredEnvVars: [],
    slots: ["article-card", "metadata-panel"],
    widgets: ["evidence-card", "citation-panel"],
    hooks: ["article.metadata.render"],
  },
  plugin: {
    schemaVersion: MARKETPLACE_IMPORT_SCHEMA_VERSION,
    id: "example-web-clipper-plugin",
    kind: "plugin",
    name: "Example Web Clipper Plugin",
    version: "1.0.0",
    compatibility: ">=4.77.1",
    author: "Example Author",
    license: "MIT",
    requiredFiles: ["plugin.json", "README.md", "preview.png"],
    permissions: ["article:create", "asset:read"],
    routes: ["/clipper-extension"],
    settings: ["defaultCategoryId"],
    widgets: ["capture-button"],
    hooks: ["article.beforeCreate"],
  },
} satisfies Record<MarketplaceImportKind, Record<string, unknown>>;

export function createMarketplaceImportPreview(source: string | unknown): MarketplaceImportPreview {
  const validationErrors: string[] = [];
  let input: unknown = source;

  if (typeof source === "string") {
    try {
      input = JSON.parse(source);
    } catch {
      return createBlockedPreview(["Import JSON could not be parsed."]);
    }
  }

  if (!isRecord(input)) {
    return createBlockedPreview(["Import preview requires a JSON object."]);
  }

  const rawKind = readString(input.kind);
  const kind = isMarketplaceImportKind(rawKind) ? rawKind : undefined;
  const metadata: MarketplaceImportMetadata = {
    author: readString(input.author),
    compatibility: readString(input.compatibility),
    id: readString(input.id),
    kind,
    license: readString(input.license),
    name: readString(input.name),
    schemaVersion: readString(input.schemaVersion),
    version: readString(input.version),
  };

  if (metadata.schemaVersion !== MARKETPLACE_IMPORT_SCHEMA_VERSION) {
    validationErrors.push(`unsupported schema version: ${metadata.schemaVersion || "missing"}`);
  }
  if (!kind) validationErrors.push(`unsupported import kind: ${rawKind || "missing"}`);
  for (const field of ["id", "name", "version", "compatibility", "author", "license"] as const) {
    if (!metadata[field]) validationErrors.push(`${field} is required`);
  }
  if (metadata.license && !isSupportedLicense(metadata.license)) {
    validationErrors.push(`unsupported license: ${metadata.license}`);
  }

  const requiredFiles = readStringArray(input.requiredFiles) ?? (kind ? requiredFilesByKind[kind] : []);
  const requiredEnvVars = readStringArray(input.requiredEnvVars) ?? (kind ? requiredEnvVarsByKind[kind] : []);
  const permissions = readStringArray(input.permissions) ?? [];
  const routes = readStringArray(input.routes) ?? [];
  const settings = readStringArray(input.settings) ?? [];
  const slots = readStringArray(input.slots) ?? [];
  const widgets = readStringArray(input.widgets) ?? [];
  const hooks = readStringArray(input.hooks) ?? [];
  const compatibilityWarnings = createCompatibilityWarnings(metadata.compatibility);
  const securityErrors = collectSecurityErrors(input);

  for (const permission of permissions) {
    if (isUnsafePermission(permission)) securityErrors.push(`unsafe permission is not allowed: ${permission}`);
  }

  if (kind === "theme-pack") {
    validationErrors.push(...validateThemePack({ ...input, kind: "theme-pack" }).errors);
  }
  if (kind === "plugin") {
    validationErrors.push(...validatePluginManifest({ ...input, kind: "plugin" }).errors);
  }

  const uniqueValidationErrors = unique(validationErrors);
  const uniqueSecurityErrors = unique(securityErrors);
  const valid = uniqueValidationErrors.length === 0 && uniqueSecurityErrors.length === 0;

  return {
    compatibilityWarnings,
    hooks,
    metadata,
    parsed: true,
    permissions,
    previewOnly: true,
    rawKind,
    requiredEnvVars,
    requiredFiles,
    routes,
    securityErrors: uniqueSecurityErrors,
    settings,
    slots,
    status: valid ? "accepted-preview" : "blocked",
    tokenDiff: kind === "theme-pack" ? createThemeTokenDiff(input.tokens) : [],
    validationErrors: uniqueValidationErrors,
    valid,
    widgets,
  };
}

function createBlockedPreview(validationErrors: string[]): MarketplaceImportPreview {
  return {
    compatibilityWarnings: [],
    hooks: [],
    metadata: {},
    parsed: false,
    permissions: [],
    previewOnly: true,
    requiredEnvVars: [],
    requiredFiles: [],
    routes: [],
    securityErrors: [],
    settings: [],
    slots: [],
    status: "blocked",
    tokenDiff: [],
    validationErrors,
    valid: false,
    widgets: [],
  };
}

function createCompatibilityWarnings(compatibility: string | undefined) {
  if (!compatibility) return [];
  if (compatibility === "future") return ["This pack targets a future Arkivel release and can only be previewed."];
  if (!isMarketplaceCompatibilitySupported(compatibility)) {
    return [`This pack targets ${compatibility}, which does not match Arkivel ${packageJson.version}.`];
  }
  return [];
}

function createThemeTokenDiff(tokens: unknown): MarketplaceTokenDiff[] {
  const importedTokens = isRecord(tokens) ? tokens : {};
  const builtInTokens = themePacks[0]?.tokens ?? {};
  const tokenNames = Array.from(new Set([...Object.keys(builtInTokens), ...Object.keys(importedTokens)])).sort();

  return tokenNames.map((token) => {
    const importedValue = readString(importedTokens[token]);
    const builtInValue = builtInTokens[token];
    const status: MarketplaceTokenDiffStatus =
      builtInValue === undefined
        ? "added"
        : importedValue === undefined
          ? "removed"
          : importedValue === builtInValue
            ? "unchanged"
            : "changed";

    return { builtInValue, importedValue, status, token };
  });
}

function collectSecurityErrors(value: unknown, path: string[] = []): string[] {
  const errors: string[] = [];
  const currentPath = path.map((segment) => segment.toLowerCase());

  if (isRecord(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      if (executableKeys.has(lowerKey)) {
        errors.push(`executable field is not allowed: ${[...path, key].join(".")}`);
      }
      if (lowerKey === "remote" && nestedValue === true) {
        errors.push(`remote source is not allowed at ${[...path, key].join(".")}`);
      }
      errors.push(...collectSecurityErrors(nestedValue, [...path, key]));
    }
    return errors;
  }

  if (Array.isArray(value)) {
    for (const [index, nestedValue] of value.entries()) {
      errors.push(...collectSecurityErrors(nestedValue, [...path, String(index)]));
    }
    return errors;
  }

  if (typeof value !== "string") return errors;

  if (hasRemoteReference(value)) {
    errors.push(`remote reference is not allowed at ${path.join(".") || "value"}`);
  }
  if (currentPath.some(isPathLikeKey) && hasPathTraversal(value)) {
    errors.push(`path traversal is not allowed at ${path.join(".")}: ${value}`);
  }

  return errors;
}

function hasRemoteReference(value: string) {
  return /\b(?:https?:\/\/|git\+|npm:|javascript:|unpkg\.com|esm\.sh|jsdelivr\.net)\b/i.test(value);
}

function hasPathTraversal(value: string) {
  return value.split(/[\\/]+/).some((segment) => segment === "..") || /^[a-z]:/i.test(value);
}

function isPathLikeKey(key: string) {
  return ["path", "requiredfiles", "screenshots", "files", "file"].includes(key);
}

function isUnsafePermission(permission: string) {
  return (
    permission.includes("*") ||
    permission === "admin:all" ||
    permission.startsWith("filesystem:") ||
    permission.startsWith("shell:") ||
    permission.startsWith("system:")
  );
}

function isMarketplaceImportKind(value: unknown): value is MarketplaceImportKind {
  return SUPPORTED_MARKETPLACE_IMPORT_KINDS.includes(value as MarketplaceImportKind);
}

function isSupportedLicense(value: string): value is MarketplaceItemLicense {
  return SUPPORTED_MARKETPLACE_LICENSES.includes(value as MarketplaceItemLicense);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value.map((item) => item.trim()).filter(Boolean)
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
