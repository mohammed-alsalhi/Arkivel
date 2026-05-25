import { EXTERNAL_REFERENCE_SCHEMA_VERSION } from "@/lib/external-references";
import { SYNC_ENTITY_TYPES, SYNC_MANIFEST_SCHEMA_VERSION, type SyncEntityType } from "@/lib/sync-manifests";

export const ARCHIVE_MIRROR_SCHEMA_VERSION = "arkivel.archive-mirror.v1";

export const ARCHIVE_SNAPSHOT_MODES = ["read-only-archive", "private-mirror", "selected-space-transfer"] as const;
export const ARCHIVE_PRESERVED_SECTIONS = ["revisions", "assets", "categories", "metadata"] as const;
export const REPEATED_SYNC_CONFLICT_STRATEGIES = ["source-wins", "target-wins", "manual-merge", "skip-and-report"] as const;

export type ArchiveSnapshotMode = (typeof ARCHIVE_SNAPSHOT_MODES)[number];
export type ArchivePreservedSection = (typeof ARCHIVE_PRESERVED_SECTIONS)[number];
export type RepeatedSyncConflictStrategy = (typeof REPEATED_SYNC_CONFLICT_STRATEGIES)[number];

export type ArchiveSnapshotPlan = {
  immutable: true;
  mode: ArchiveSnapshotMode;
  preserved: ArchivePreservedSection[];
  readOnly: true;
  sections: SyncEntityType[];
};

export type SpaceTransferWorkflow = {
  id: string;
  steps: string[];
  uses: {
    externalReferences: typeof EXTERNAL_REFERENCE_SCHEMA_VERSION;
    syncManifest: typeof SYNC_MANIFEST_SCHEMA_VERSION;
  };
};

export const privateMirrorSetupDocs = [
  {
    audience: "teams",
    checklist: [
      "Create a private target workspace before importing content.",
      "Require authenticated visibility for mirrored spaces.",
      "Preserve revisions and comments only inside the private mirror.",
      "Review external reference provenance before enabling public links.",
    ],
  },
  {
    audience: "personal wikis",
    checklist: [
      "Export selected spaces from the source install.",
      "Keep API keys, sessions, and analytics out of the mirror bundle.",
      "Run dry-run conflict reports before repeated syncs.",
      "Store signed archive manifests next to local backups.",
    ],
  },
] as const;

export const archiveMirrorContract = {
  apiRoute: "/api/archive-mirrors",
  docs: "docs/archive-mirror-workflows.md",
  releaseDecision: {
    checkpoint: "v4.93.2",
    question: "Does federation graduate before v5?",
    requiredEvidence: ["repeated sync dry runs", "private mirror privacy review", "archive restore rehearsal", "conflict resolution acceptance"],
    status: "defer-live-federation-until-proven",
  },
  schemaVersion: ARCHIVE_MIRROR_SCHEMA_VERSION,
  snapshotModes: ARCHIVE_SNAPSHOT_MODES,
} as const;

export function createReadOnlyArchiveSnapshotPlan(mode: ArchiveSnapshotMode = "read-only-archive"): ArchiveSnapshotPlan {
  return {
    immutable: true,
    mode,
    preserved: [...ARCHIVE_PRESERVED_SECTIONS],
    readOnly: true,
    sections: mode === "selected-space-transfer" ? ["categories", "articles", "tags", "assets", "revisions", "customizations"] : [...SYNC_ENTITY_TYPES],
  };
}

export function createSelectedSpaceTransferWorkflow(spaceIds: string[]): SpaceTransferWorkflow {
  return {
    id: "selected-space-transfer",
    steps: [
      "Select source spaces and export scope.",
      "Generate sync manifest and signed archive snapshot.",
      "Run import dry-run against the target install.",
      "Resolve repeated-sync conflicts before applying changes.",
      "Record external provenance for imported or mirrored content.",
    ],
    uses: {
      externalReferences: EXTERNAL_REFERENCE_SCHEMA_VERSION,
      syncManifest: SYNC_MANIFEST_SCHEMA_VERSION,
    },
    ...(spaceIds.length > 0 ? { spaceIds } : {}),
  } as SpaceTransferWorkflow & { spaceIds?: string[] };
}

export function createRepeatedSyncConflictNotes(strategy: RepeatedSyncConflictStrategy) {
  const base = {
    repeatedSync: true,
    strategy,
  };

  if (strategy === "manual-merge") {
    return {
      ...base,
      notes: ["Compare checksums before applying.", "Keep divergent revisions on both sides.", "Require operator notes for article, category, and customization conflicts."],
      recommended: true,
    };
  }

  return {
    ...base,
    notes: ["Run dry-run reports before applying.", "Record skipped or overwritten ids in the sync report."],
    recommended: strategy === "skip-and-report",
  };
}

export function createArchiveMirrorReport() {
  return {
    archiveSnapshot: createReadOnlyArchiveSnapshotPlan(),
    conflictResolution: REPEATED_SYNC_CONFLICT_STRATEGIES.map(createRepeatedSyncConflictNotes),
    contract: archiveMirrorContract,
    privateMirrorSetupDocs,
    releaseDecision: archiveMirrorContract.releaseDecision,
    selectedSpaceTransfer: createSelectedSpaceTransferWorkflow(["docs", "handbook"]),
  };
}
