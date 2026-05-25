export const UPGRADE_ASSISTANT_SCHEMA_VERSION = "arkivel.upgrade-assistant.v1";

export const UPGRADE_READINESS_CHECKS = [
  "version",
  "node",
  "prisma",
  "database",
  "env-vars",
  "plugins",
  "marketplace-packs",
  "migrations",
] as const;

export const PRE_UPGRADE_DIAGNOSTICS = [
  "package-version",
  "node-version",
  "prisma-generate-status",
  "database-connectivity",
  "pending-migrations",
  "recent-backup",
  "restore-rehearsal",
  "deprecated-env-vars",
] as const;

export const POST_UPGRADE_SMOKE_CHECKS = [
  "admin-login",
  "article-render",
  "search-query",
  "api-v1-contract",
  "marketplace-registry",
  "plugin-list",
  "customization-preview",
  "backup-restore-report",
] as const;

export const COMPATIBILITY_WARNING_TYPES = [
  "deprecated-env-var",
  "deprecated-api",
  "plugin-permission",
  "pack-schema-version",
] as const;

export const upgradeAssistantContract = {
  apiRoute: "/api/upgrade-assistant",
  docs: "docs/v5-upgrade-planning.md",
  links: {
    changelog: "CHANGELOG.md",
    migrationReadiness: "docs/migration-readiness.md",
    backupRestore: "docs/backup-restore.md",
    roadmap: "ROADMAP.md",
  },
  readinessChecks: UPGRADE_READINESS_CHECKS,
  schemaVersion: UPGRADE_ASSISTANT_SCHEMA_VERSION,
} as const;

export function createUpgradeReadinessChecklist() {
  return UPGRADE_READINESS_CHECKS.map((id) => ({
    id,
    required: true,
    status: "needs-review" as const,
  }));
}

export function createUpgradeDiagnosticsPlan() {
  return {
    postUpgradeSmokeChecks: POST_UPGRADE_SMOKE_CHECKS.map((id) => ({
      id,
      required: true,
    })),
    preUpgradeDiagnostics: PRE_UPGRADE_DIAGNOSTICS.map((id) => ({
      id,
      required: true,
    })),
  };
}

export function createCompatibilityWarnings(input: {
  deprecatedApis?: string[];
  deprecatedEnvVars?: string[];
  packSchemaVersions?: string[];
  pluginPermissions?: string[];
}) {
  return [
    ...(input.deprecatedEnvVars ?? []).map((value) => ({
      detail: value,
      type: "deprecated-env-var" as const,
    })),
    ...(input.deprecatedApis ?? []).map((value) => ({
      detail: value,
      type: "deprecated-api" as const,
    })),
    ...(input.pluginPermissions ?? []).map((value) => ({
      detail: value,
      type: "plugin-permission" as const,
    })),
    ...(input.packSchemaVersions ?? []).map((value) => ({
      detail: value,
      type: "pack-schema-version" as const,
    })),
  ];
}

export function createUpgradeAssistantReport() {
  return {
    compatibilityWarningTypes: COMPATIBILITY_WARNING_TYPES,
    contract: upgradeAssistantContract,
    diagnosticsPlan: createUpgradeDiagnosticsPlan(),
    inAppLinks: [
      { href: "/help", id: "help", label: "Help" },
      { href: "/features", id: "features", label: "Features" },
      { href: "/api-docs", id: "api-docs", label: "API docs" },
      { href: "/api/migration-readiness", id: "migration-readiness", label: "Migration readiness report" },
      { href: "/api/backup-restore", id: "backup-restore", label: "Backup and restore report" },
    ],
    readinessChecklist: createUpgradeReadinessChecklist(),
    v5PlanningGuide: [
      "Run migration readiness and backup/restore reports before upgrading.",
      "Resolve deprecated env vars, API usage, plugin permissions, and pack schema warnings.",
      "Run pre-upgrade diagnostics during a maintenance window.",
      "Apply the upgrade, regenerate Prisma, and run migrations.",
      "Run post-upgrade smoke checks before reopening write traffic.",
    ],
  };
}

export function hasBlockingCompatibilityWarning(warnings: ReturnType<typeof createCompatibilityWarnings>) {
  return warnings.some((warning) => warning.type === "deprecated-env-var" || warning.type === "plugin-permission");
}
