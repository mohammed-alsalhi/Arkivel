export const BACKUP_RESTORE_SCHEMA_VERSION = "arkivel.backup-restore.v1";

export const BACKUP_WIZARD_SECTIONS = [
  {
    id: "database",
    label: "Database",
    evidence: ["pg_dump path", "database URL redaction", "row-count summary", "schema hash"],
  },
  {
    id: "assets",
    label: "Assets",
    evidence: ["asset archive path", "checksum manifest", "missing-file scan"],
  },
  {
    id: "env-vars",
    label: "Environment variables",
    evidence: ["redacted env export", "required variable checklist", "secret storage note"],
  },
  {
    id: "marketplace-packs",
    label: "Marketplace packs",
    evidence: ["pack ids", "versions", "checksums", "local source paths"],
  },
  {
    id: "plugin-manifests",
    label: "Plugin manifests",
    evidence: ["plugin ids", "permissions", "routes", "trusted source paths"],
  },
  {
    id: "customization-settings",
    label: "Customization settings",
    evidence: ["style preset", "color theme", "layout preset", "space overrides"],
  },
] as const;

export const RESTORE_CONFLICT_TYPES = [
  "missing-section",
  "checksum-mismatch",
  "unsupported-schema",
  "newer-target-version",
  "duplicate-slug",
  "unsafe-plugin-permission",
] as const;

export const BACKUP_STORAGE_TARGETS = [
  {
    id: "local-disk",
    notes: ["encrypt at rest", "store outside app directory", "rotate manually"],
  },
  {
    id: "s3-compatible",
    notes: ["use least-privilege credentials", "enable object versioning", "test restore downloads"],
  },
  {
    id: "offsite-drive",
    notes: ["keep one offline copy", "label backup date/version", "verify checksums before restore"],
  },
] as const;

export const backupRestoreContract = {
  adminRoute: "/admin/maintenance",
  apiRoute: "/api/backup-restore",
  docs: "docs/backup-restore.md",
  rehearsalMode: {
    conflictTypes: RESTORE_CONFLICT_TYPES,
    writesAllowed: false,
  },
  schemaVersion: BACKUP_RESTORE_SCHEMA_VERSION,
  storageTargets: BACKUP_STORAGE_TARGETS.map((target) => target.id),
  wizardSections: BACKUP_WIZARD_SECTIONS.map((section) => section.id),
} as const;

export type RestoreManifestSection = {
  checksum?: string;
  id: string;
  schemaVersion?: string;
};

export type RestoreManifest = {
  arkivelVersion?: string;
  sections: RestoreManifestSection[];
  schemaVersion?: string;
};

export function createBackupWizardPlan() {
  return BACKUP_WIZARD_SECTIONS.map((section, index) => ({
    ...section,
    order: index + 1,
    required: true,
  }));
}

export function createScheduledBackupPlan() {
  return {
    cadenceOptions: ["daily", "weekly", "before-upgrade", "manual-only"],
    requiredRetentionNotes: ["keep at least one pre-upgrade backup", "keep one offsite copy", "verify restore before deleting old backups"],
    storageTargets: BACKUP_STORAGE_TARGETS,
  };
}

export function validateRestoreManifest(manifest: RestoreManifest) {
  const sections = new Map(manifest.sections.map((section) => [section.id, section]));
  const conflicts = RESTORE_CONFLICT_TYPES.flatMap((type) => {
    if (type !== "missing-section") return [];
    return BACKUP_WIZARD_SECTIONS.filter((section) => !sections.has(section.id)).map((section) => ({
      detail: `Restore manifest is missing ${section.label}.`,
      section: section.id,
      type,
    }));
  });
  const checksumConflicts = manifest.sections
    .filter((section) => section.checksum === "")
    .map((section) => ({
      detail: `Restore manifest section ${section.id} has an empty checksum.`,
      section: section.id,
      type: "checksum-mismatch" as const,
    }));
  const schemaConflicts = manifest.schemaVersion && manifest.schemaVersion !== BACKUP_RESTORE_SCHEMA_VERSION
    ? [{
      detail: `Restore manifest schema ${manifest.schemaVersion} is not ${BACKUP_RESTORE_SCHEMA_VERSION}.`,
      section: "manifest",
      type: "unsupported-schema" as const,
    }]
    : [];

  return {
    conflicts: [...conflicts, ...checksumConflicts, ...schemaConflicts],
    valid: conflicts.length === 0 && checksumConflicts.length === 0 && schemaConflicts.length === 0,
  };
}

export function createRestoreRehearsalReport(manifest: RestoreManifest) {
  const validation = validateRestoreManifest(manifest);

  return {
    conflictReport: validation.conflicts,
    manifestVerification: validation,
    mode: "rehearsal",
    writesAllowed: false,
  };
}

export function createBackupRestoreReport() {
  return {
    contract: backupRestoreContract,
    disasterRecoveryDrill: [
      "Export database, assets, env vars, marketplace packs, plugin manifests, and customization settings.",
      "Restore to a scratch database and asset directory.",
      "Verify admin login, sample article render, marketplace registry, plugin list, and customization preview.",
      "Record recovery time, conflicts, owner, and follow-up tasks.",
    ],
    scheduledBackupPlan: createScheduledBackupPlan(),
    wizardPlan: createBackupWizardPlan(),
  };
}
