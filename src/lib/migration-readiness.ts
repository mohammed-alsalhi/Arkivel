export const MIGRATION_READINESS_SCHEMA_VERSION = "arkivel.migration-readiness.v1";

export const MIGRATION_DRY_RUN_PHASES = [
  {
    id: "backup-prompt",
    label: "Backup prompt",
    requiredEvidence: ["database dump", "asset archive", "env redaction check", "restore target selected"],
    recoveryGuidance: "Stop before schema changes until a restorable database dump and asset archive exist.",
  },
  {
    id: "schema-compatibility",
    label: "Schema compatibility",
    requiredEvidence: ["current Prisma schema hash", "target Prisma schema hash", "pending migration list", "breaking decision log"],
    recoveryGuidance: "Do not apply migrations when destructive changes are unreviewed or the compatibility report is stale.",
  },
  {
    id: "data-integrity",
    label: "Data integrity",
    requiredEvidence: ["article counts", "revision counts", "category tree checks", "workspace scope checks", "orphan scan"],
    recoveryGuidance: "Fix orphaned records, missing workspace scopes, and checksum drift before continuing.",
  },
  {
    id: "restore-validation",
    label: "Restore validation",
    requiredEvidence: ["scratch database restore", "asset checksum verification", "admin login check", "sample article render"],
    recoveryGuidance: "Treat an untested restore as no backup; rehearse restore on a scratch database before upgrading.",
  },
  {
    id: "failure-recovery",
    label: "Failure recovery",
    requiredEvidence: ["rollback owner", "maintenance window", "read-only mode plan", "support bundle path"],
    recoveryGuidance: "Keep the site read-only until operators choose restore, forward-fix, or manual repair.",
  },
] as const;

export const REPRESENTATIVE_V4_UPGRADE_PATHS = [
  {
    id: "personal-wiki-v4-80",
    source: "v4.80.x personal wiki",
    focus: ["single-user auth", "article revisions", "local assets", "portable bundles"],
  },
  {
    id: "team-workspace-v4-82",
    source: "v4.82.x team workspace",
    focus: ["Wiki workspace scopes", "memberships", "invitations", "role templates"],
  },
  {
    id: "public-docs-v4-86",
    source: "v4.86.x public documentation",
    focus: ["public API v1", "feeds", "sitemap visibility", "search contracts"],
  },
  {
    id: "marketplace-heavy-v4-90",
    source: "v4.90.x marketplace-heavy install",
    focus: ["style packs", "theme packs", "component packs", "template packs"],
  },
  {
    id: "plugin-enabled-v4-92",
    source: "v4.92.x plugin-enabled install",
    focus: ["trusted local plugins", "assistant packs", "permissions", "audit events"],
  },
] as const;

export const PRISMA_FREEZE_DECISIONS = [
  {
    id: "workspace-boundary",
    decision: "Keep Wiki as the durable workspace boundary for v5.",
    breaking: false,
    notes: "Legacy unscoped rows remain a migration concern, not a new v5 model.",
  },
  {
    id: "plugin-state-contract",
    decision: "Keep PluginState as manifest-backed runtime state before any sandbox expansion.",
    breaking: false,
    notes: "Remote arbitrary-code loading remains outside the v5 stable contract.",
  },
  {
    id: "marketplace-preview-only-imports",
    decision: "Keep marketplace imports preview-only until restore and rollback flows are proven.",
    breaking: false,
    notes: "Install-capable marketplace flows must reuse the same validation and backup prompts.",
  },
  {
    id: "destructive-schema-changes",
    decision: "Require explicit release notes and restore evidence for any destructive schema migration before freeze.",
    breaking: true,
    notes: "Destructive migration decisions block v5 unless documented with a tested recovery path.",
  },
] as const;

export const MIGRATION_TEST_SURFACES = [
  "customization",
  "marketplace",
  "plugins",
  "spaces",
  "templates",
] as const;

export const migrationReadinessContract = {
  adminOperationsReport: {
    id: "schema-compatibility-report",
    required: true,
    surfaces: ["database", "prisma", "customization", "marketplace", "plugins", "spaces", "templates"],
  },
  apiRoute: "/api/migration-readiness",
  docs: "docs/migration-readiness.md",
  dryRunPhases: MIGRATION_DRY_RUN_PHASES.map((phase) => phase.id),
  schemaVersion: MIGRATION_READINESS_SCHEMA_VERSION,
  testSurfaces: MIGRATION_TEST_SURFACES,
  upgradePaths: REPRESENTATIVE_V4_UPGRADE_PATHS.map((path) => path.id),
} as const;

export function createMigrationDryRunPlan() {
  return MIGRATION_DRY_RUN_PHASES.map((phase, index) => ({
    ...phase,
    blocking: true,
    order: index + 1,
  }));
}

export function createRepresentativeUpgradeMatrix() {
  return REPRESENTATIVE_V4_UPGRADE_PATHS.map((path) => ({
    ...path,
    expectedEvidence: ["migration dry-run report", "restore validation report", "schema compatibility report"],
    target: "latest v4 beta",
  }));
}

export function createSchemaCompatibilityReport() {
  return {
    decisions: PRISMA_FREEZE_DECISIONS,
    reportId: "arkivel-schema-compatibility",
    releaseGate: {
      blocksOnDestructiveUndocumentedChanges: true,
      requiresAdminOperationsVisibility: true,
      requiresRestoreEvidence: true,
      status: "required-before-v5",
    },
    surfaces: migrationReadinessContract.adminOperationsReport.surfaces,
  };
}

export function createMigrationTestMatrix() {
  return MIGRATION_TEST_SURFACES.map((surface) => ({
    dryRunRequired: true,
    restoreValidationRequired: true,
    surface,
  }));
}

export function createMigrationReadinessReport() {
  return {
    contract: migrationReadinessContract,
    dryRunPlan: createMigrationDryRunPlan(),
    schemaCompatibility: createSchemaCompatibilityReport(),
    testMatrix: createMigrationTestMatrix(),
    upgradePaths: createRepresentativeUpgradeMatrix(),
  };
}

export function migrationCoverageIncludes(surface: string) {
  return MIGRATION_TEST_SURFACES.includes(surface as (typeof MIGRATION_TEST_SURFACES)[number]);
}
