import packageJson from "../../package.json";

export const PORTABLE_BUNDLE_SCHEMA_VERSION = "arkivel.portable-bundle.v1";

export const PORTABLE_BUNDLE_SECTIONS = [
  "articles",
  "revisions",
  "categories",
  "tags",
  "users",
  "settings",
  "pluginState",
  "maps",
  "comments",
  "discussions",
  "assets",
  "customizations",
] as const;

export const PORTABLE_BUNDLE_EXCLUDED_SECTIONS = [
  "sessions",
  "apiKeys",
  "analytics",
] as const;

export const PORTABLE_BUNDLE_PRIVACY_FILTERS = [
  "privateSpaces",
  "draftContent",
  "users",
  "analytics",
  "apiKeys",
] as const;

export type PortableBundleSection = (typeof PORTABLE_BUNDLE_SECTIONS)[number];
export type PortableBundleExcludedSection = (typeof PORTABLE_BUNDLE_EXCLUDED_SECTIONS)[number];
export type PortableBundlePrivacyFilter = (typeof PORTABLE_BUNDLE_PRIVACY_FILTERS)[number];

export type PortableBundleChecksum = {
  algorithm: "sha256";
  files: Record<string, string>;
  manifest: string;
};

export type PortableBundleSource = {
  baseUrl: string;
  exportedBy?: string;
  instanceId?: string;
  name: string;
};

export type PortableBundleExportScope = {
  excluded: PortableBundleExcludedSection[];
  included: PortableBundleSection[];
  privacyFilters: PortableBundlePrivacyFilter[];
};

export type PortableBundleManifest = {
  appVersion: string;
  checksums: PortableBundleChecksum;
  createdAt: string;
  exportScope: PortableBundleExportScope;
  schemaVersion: typeof PORTABLE_BUNDLE_SCHEMA_VERSION;
  source: PortableBundleSource;
};

export type PortableImportConflictType =
  | "duplicate-slug"
  | "missing-asset"
  | "unsupported-schema"
  | "permission-gap"
  | "category-conflict"
  | "tag-conflict"
  | "user-conflict";

export type PortableImportDryRunIssue = {
  code: string;
  message: string;
  path?: string;
  severity: "blocked" | "warning" | "info";
  type: PortableImportConflictType;
};

export type PortableImportDryRunReport = {
  blockedChanges: PortableImportDryRunIssue[];
  compatibility: {
    appVersion: string;
    compatible: boolean;
    schemaVersion: string;
  };
  conflicts: PortableImportDryRunIssue[];
  missingAssets: PortableImportDryRunIssue[];
  permissionGaps: PortableImportDryRunIssue[];
  recommendedActions: string[];
  summary: {
    assets: number;
    articles: number;
    categories: number;
    revisions: number;
    users: number;
  };
};

export const portableBundleCompatibilityPromise = {
  beforeV5: [
    "v4 portable bundles are schema-versioned preview artifacts.",
    "Import must dry-run and report conflicts before any write.",
    "Sessions, API keys, and analytics are excluded by default.",
    "Privacy filters must be explicit in the manifest.",
    "v5 compatibility requires documented migration notes for schema changes.",
  ],
  stableTarget: "v5.0.0",
};

export const portableBundleContract = {
  checksums: {
    algorithm: "sha256",
    required: ["manifest", "files"],
  },
  compatibility: portableBundleCompatibilityPromise,
  dryRunReport: {
    conflictTypes: ["duplicate-slug", "missing-asset", "unsupported-schema", "permission-gap", "category-conflict", "tag-conflict", "user-conflict"],
    requiredGroups: ["conflicts", "missingAssets", "permissionGaps", "blockedChanges", "recommendedActions"],
  },
  exportScope: {
    excludedSections: PORTABLE_BUNDLE_EXCLUDED_SECTIONS,
    includedSections: PORTABLE_BUNDLE_SECTIONS,
    privacyFilters: PORTABLE_BUNDLE_PRIVACY_FILTERS,
  },
  manifestFields: ["schemaVersion", "appVersion", "source", "createdAt", "exportScope", "checksums"],
  schemaVersion: PORTABLE_BUNDLE_SCHEMA_VERSION,
};

export function createPortableBundleManifest(input: {
  checksums?: Partial<PortableBundleChecksum>;
  createdAt?: string;
  exportScope?: Partial<PortableBundleExportScope>;
  source: PortableBundleSource;
}): PortableBundleManifest {
  return {
    appVersion: packageJson.version,
    checksums: {
      algorithm: "sha256",
      files: input.checksums?.files ?? {},
      manifest: input.checksums?.manifest ?? "",
    },
    createdAt: input.createdAt ?? new Date().toISOString(),
    exportScope: {
      excluded: input.exportScope?.excluded ?? [...PORTABLE_BUNDLE_EXCLUDED_SECTIONS],
      included: input.exportScope?.included ?? [...PORTABLE_BUNDLE_SECTIONS],
      privacyFilters: input.exportScope?.privacyFilters ?? [...PORTABLE_BUNDLE_PRIVACY_FILTERS],
    },
    schemaVersion: PORTABLE_BUNDLE_SCHEMA_VERSION,
    source: input.source,
  };
}

export function createPortableImportDryRunReport(input?: Partial<PortableImportDryRunReport>): PortableImportDryRunReport {
  return {
    blockedChanges: input?.blockedChanges ?? [],
    compatibility: input?.compatibility ?? {
      appVersion: packageJson.version,
      compatible: true,
      schemaVersion: PORTABLE_BUNDLE_SCHEMA_VERSION,
    },
    conflicts: input?.conflicts ?? [],
    missingAssets: input?.missingAssets ?? [],
    permissionGaps: input?.permissionGaps ?? [],
    recommendedActions: input?.recommendedActions ?? ["Review the dry-run report before applying any bundle."],
    summary: input?.summary ?? {
      articles: 0,
      assets: 0,
      categories: 0,
      revisions: 0,
      users: 0,
    },
  };
}
