import { PORTABLE_BUNDLE_SCHEMA_VERSION, createPortableImportDryRunReport } from "@/lib/portable-bundle";

export const IMPORT_REHEARSAL_SCHEMA_VERSION = "arkivel.import-rehearsal.v1";

export const IMPORT_CONFLICT_CATEGORIES = [
  "duplicate-slugs",
  "category-conflicts",
  "tag-conflicts",
  "user-mapping",
  "asset-mapping",
  "revision-preservation",
  "unsupported-schema",
  "permission-gaps",
] as const;

export const IMPORT_RECOMMENDED_ACTIONS = [
  "rename-slug",
  "merge-category",
  "create-category",
  "merge-tag",
  "create-tag",
  "map-user",
  "skip-user",
  "map-asset",
  "skip-asset",
  "preserve-revisions",
  "skip-revisions",
  "block-import",
] as const;

export type ImportConflictCategory = (typeof IMPORT_CONFLICT_CATEGORIES)[number];
export type ImportRecommendedAction = (typeof IMPORT_RECOMMENDED_ACTIONS)[number];

export type ImportRollbackStep = {
  action: "delete-created" | "restore-updated" | "restore-asset" | "restore-category" | "restore-tag";
  target: string;
};

export type ImportRehearsalPlan = {
  blockedChanges: string[];
  conflictCategories: typeof IMPORT_CONFLICT_CATEGORIES;
  recommendedActions: typeof IMPORT_RECOMMENDED_ACTIONS;
  rollbackPlan: ImportRollbackStep[];
  schemaVersion: typeof IMPORT_REHEARSAL_SCHEMA_VERSION;
  writeAllowed: false;
};

export const importRehearsalFixtures = [
  {
    description: "Minimal personal wiki with a homepage, one category, one tag, and one asset.",
    id: "small-wiki",
  },
  {
    description: "Large archive rehearsal fixture with many articles, revisions, assets, and tag merges.",
    id: "large-archive",
  },
  {
    description: "Docs portal fixture with versioned categories, redirects, and public/private page filters.",
    id: "docs-portal",
  },
  {
    description: "Worldbuilding atlas fixture with maps, characters, locations, revisions, and custom metadata.",
    id: "worldbuilding-atlas",
  },
] as const;

export const importRehearsalContract = {
  conflictCategories: IMPORT_CONFLICT_CATEGORIES,
  dryRunOnly: true,
  fixtures: importRehearsalFixtures,
  recommendedActions: IMPORT_RECOMMENDED_ACTIONS,
  rollbackPlanRequired: true,
  schemaVersion: IMPORT_REHEARSAL_SCHEMA_VERSION,
};

export function createImportRehearsalPlan(input?: {
  blockedChanges?: string[];
  rollbackPlan?: ImportRollbackStep[];
}): ImportRehearsalPlan {
  return {
    blockedChanges: input?.blockedChanges ?? [],
    conflictCategories: IMPORT_CONFLICT_CATEGORIES,
    recommendedActions: IMPORT_RECOMMENDED_ACTIONS,
    rollbackPlan: input?.rollbackPlan ?? [],
    schemaVersion: IMPORT_REHEARSAL_SCHEMA_VERSION,
    writeAllowed: false,
  };
}

export function createImportDryRunPreview(input?: {
  blockedChanges?: string[];
  rollbackPlan?: ImportRollbackStep[];
}) {
  const plan = createImportRehearsalPlan(input);
  return {
    dryRunReport: createPortableImportDryRunReport({
      blockedChanges: plan.blockedChanges.map((message) => ({
        code: "blocked-change",
        message,
        severity: "blocked",
        type: "permission-gap",
      })),
      compatibility: {
        appVersion: "preview",
        compatible: true,
        schemaVersion: PORTABLE_BUNDLE_SCHEMA_VERSION,
      },
      recommendedActions: [...IMPORT_RECOMMENDED_ACTIONS],
    }),
    plan,
  };
}
