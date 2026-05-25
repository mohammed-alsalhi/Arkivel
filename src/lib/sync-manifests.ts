import packageJson from "../../package.json";
import { sha256 } from "@/lib/export-hardening";

export const SYNC_MANIFEST_SCHEMA_VERSION = "arkivel.sync-manifest.v1";

export const SYNC_ENTITY_TYPES = [
  "categories",
  "articles",
  "tags",
  "assets",
  "revisions",
  "comments",
  "customizations",
] as const;

export const SYNC_VISIBILITY_RULES = [
  "public-only",
  "authenticated",
  "private-space",
  "sensitive-article",
  "admin-only",
] as const;

export const SYNC_CONFLICT_TYPES = [
  "slug-collision",
  "missing-parent",
  "checksum-mismatch",
  "visibility-downgrade",
  "schema-mismatch",
  "customization-overwrite",
  "revision-history-divergence",
] as const;

export const SYNC_SNAPSHOT_TARGETS = ["public-read-replica", "private-mirror"] as const;

export type SyncEntityType = (typeof SYNC_ENTITY_TYPES)[number];
export type SyncVisibilityRule = (typeof SYNC_VISIBILITY_RULES)[number];
export type SyncConflictType = (typeof SYNC_CONFLICT_TYPES)[number];
export type SyncSnapshotTarget = (typeof SYNC_SNAPSHOT_TARGETS)[number];

export type SyncEndpoint = {
  baseUrl: string;
  instanceId: string;
  name: string;
  spaceId?: string;
};

export type SyncManifestEntity = {
  checksum: string;
  count: number;
  type: SyncEntityType;
  visibility: SyncVisibilityRule[];
};

export type SyncManifest = {
  appVersion: string;
  checksums: {
    algorithm: "sha256";
    manifest: string;
    sections: Record<SyncEntityType, string>;
  };
  conflictPolicy: "dry-run-only" | "skip-conflicts" | "manual-review";
  createdAt: string;
  networkFederation: {
    stableScope: false;
    status: "excluded-until-proven-reliable";
  };
  schemaVersion: typeof SYNC_MANIFEST_SCHEMA_VERSION;
  source: SyncEndpoint;
  target: SyncEndpoint;
  visibilityRules: SyncVisibilityRule[];
  entities: SyncManifestEntity[];
};

export type SyncDryRunConflict = {
  action: "skip" | "block" | "manual-review";
  code: string;
  entityId?: string;
  message: string;
  type: SyncConflictType;
};

export type SyncDryRunSection = {
  conflicts: SyncDryRunConflict[];
  creates: number;
  deletes: number;
  updates: number;
  warnings: string[];
};

export type SyncDryRunReport = {
  dryRunOnly: true;
  sections: Record<SyncEntityType, SyncDryRunSection>;
  summary: {
    blocked: boolean;
    creates: number;
    deletes: number;
    manualReview: number;
    updates: number;
  };
  recommendations: string[];
};

export type SignedSnapshotPlan = {
  includes: SyncEntityType[];
  keyManagement: string[];
  manifestSignature: {
    algorithm: "ed25519";
    required: true;
  };
  target: SyncSnapshotTarget;
  visibility: SyncVisibilityRule[];
};

export const syncManifestContract = {
  apiRoute: "/api/sync-manifests",
  docs: "docs/sync-manifests.md",
  dryRun: {
    required: true,
    sections: SYNC_ENTITY_TYPES,
  },
  manifestFields: ["schemaVersion", "appVersion", "source", "target", "entities", "checksums", "visibilityRules", "conflictPolicy"],
  networkFederation: {
    stableScope: false,
    releaseGate: "Keep network federation out of stable scope unless repeated sync and mirror workflows prove reliable.",
  },
  schemaVersion: SYNC_MANIFEST_SCHEMA_VERSION,
  signedSnapshots: {
    targets: SYNC_SNAPSHOT_TARGETS,
    signatureAlgorithm: "ed25519",
  },
} as const;

export const stagingPromotionChecklist = [
  "Run a dry-run sync report against production before any write.",
  "Review visibility downgrades, private-space omissions, and sensitive-article exclusions.",
  "Compare manifest and section checksums between staging and production.",
  "Keep revision history and comments in manual review when source and target diverge.",
  "Promote customizations only after confirming theme, layout, marketplace, and plugin compatibility.",
] as const;

export function createSyncManifest(input: {
  createdAt?: string;
  entities?: Partial<Record<SyncEntityType, { count: number; visibility?: SyncVisibilityRule[]; payload?: string }>>;
  source: SyncEndpoint;
  target: SyncEndpoint;
}): SyncManifest {
  const entities = SYNC_ENTITY_TYPES.map((type) => {
    const entity = input.entities?.[type];
    return {
      checksum: sha256(entity?.payload ?? `${type}:0`),
      count: entity?.count ?? 0,
      type,
      visibility: entity?.visibility ?? ["public-only"],
    };
  });
  const sections = Object.fromEntries(entities.map((entity) => [entity.type, entity.checksum])) as Record<SyncEntityType, string>;
  const manifestSeed = JSON.stringify({ source: input.source, target: input.target, sections });

  return {
    appVersion: packageJson.version,
    checksums: {
      algorithm: "sha256",
      manifest: sha256(manifestSeed),
      sections,
    },
    conflictPolicy: "dry-run-only",
    createdAt: input.createdAt ?? new Date().toISOString(),
    entities,
    networkFederation: {
      stableScope: false,
      status: "excluded-until-proven-reliable",
    },
    schemaVersion: SYNC_MANIFEST_SCHEMA_VERSION,
    source: input.source,
    target: input.target,
    visibilityRules: [...SYNC_VISIBILITY_RULES],
  };
}

function emptyDryRunSection(): SyncDryRunSection {
  return {
    conflicts: [],
    creates: 0,
    deletes: 0,
    updates: 0,
    warnings: [],
  };
}

export function createSyncDryRunReport(input?: Partial<Record<SyncEntityType, Partial<SyncDryRunSection>>>): SyncDryRunReport {
  const sections = Object.fromEntries(
    SYNC_ENTITY_TYPES.map((type) => {
      const base = emptyDryRunSection();
      const override = input?.[type];
      return [
        type,
        {
          conflicts: override?.conflicts ?? base.conflicts,
          creates: override?.creates ?? base.creates,
          deletes: override?.deletes ?? base.deletes,
          updates: override?.updates ?? base.updates,
          warnings: override?.warnings ?? base.warnings,
        },
      ];
    }),
  ) as Record<SyncEntityType, SyncDryRunSection>;
  const values = Object.values(sections);
  const manualReview = values.flatMap((section) => section.conflicts).filter((conflict) => conflict.action === "manual-review").length;

  return {
    dryRunOnly: true,
    recommendations: [
      "Resolve blocked conflicts before applying a sync.",
      "Keep private mirrors separate from public read replicas.",
      "Record signed snapshot manifests before promoting staging content.",
    ],
    sections,
    summary: {
      blocked: values.some((section) => section.conflicts.some((conflict) => conflict.action === "block")),
      creates: values.reduce((sum, section) => sum + section.creates, 0),
      deletes: values.reduce((sum, section) => sum + section.deletes, 0),
      manualReview,
      updates: values.reduce((sum, section) => sum + section.updates, 0),
    },
  };
}

export function createSignedSnapshotPlan(target: SyncSnapshotTarget): SignedSnapshotPlan {
  const publicReplica = target === "public-read-replica";

  return {
    includes: publicReplica ? ["categories", "articles", "tags", "assets", "customizations"] : [...SYNC_ENTITY_TYPES],
    keyManagement: [
      "Store signing keys outside exported bundles.",
      "Rotate snapshot signing keys separately from API keys.",
      "Publish verifier fingerprints with the target instance configuration.",
    ],
    manifestSignature: {
      algorithm: "ed25519",
      required: true,
    },
    target,
    visibility: publicReplica ? ["public-only"] : ["authenticated", "private-space", "sensitive-article", "admin-only"],
  };
}

export function createSyncManifestReport() {
  return {
    contract: syncManifestContract,
    dryRun: createSyncDryRunReport(),
    exampleManifest: createSyncManifest({
      createdAt: "2026-05-25T00:00:00.000Z",
      entities: {
        articles: { count: 12, payload: "articles:12", visibility: ["public-only", "authenticated"] },
        categories: { count: 4, payload: "categories:4" },
        customizations: { count: 3, payload: "customizations:3", visibility: ["admin-only"] },
      },
      source: { baseUrl: "https://staging.example.test", instanceId: "arkivel-staging", name: "Staging" },
      target: { baseUrl: "https://docs.example.test", instanceId: "arkivel-production", name: "Production" },
    }),
    signedSnapshots: SYNC_SNAPSHOT_TARGETS.map((target) => createSignedSnapshotPlan(target)),
    stagingPromotionChecklist,
  };
}
