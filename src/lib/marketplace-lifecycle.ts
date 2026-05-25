import { marketplaceItems, type MarketplaceItem, type MarketplaceItemStatus } from "./marketplace";

export const MARKETPLACE_LIFECYCLE_SCHEMA_VERSION = "2026-05-25.v4.90.1";

export const PACK_LIFECYCLE_STATES = [
  "draft",
  "previewed",
  "installed-local",
  "enabled",
  "disabled",
  "deprecated",
  "incompatible",
  "blocked",
  "removed",
] as const;

export type PackLifecycleState = (typeof PACK_LIFECYCLE_STATES)[number];

export const packLifecycleTransitions: Record<PackLifecycleState, PackLifecycleState[]> = {
  draft: ["previewed", "blocked", "removed"],
  previewed: ["installed-local", "blocked", "incompatible", "removed"],
  "installed-local": ["enabled", "disabled", "deprecated", "removed"],
  enabled: ["disabled", "deprecated", "blocked"],
  disabled: ["enabled", "deprecated", "removed"],
  deprecated: ["disabled", "removed"],
  incompatible: ["previewed", "removed"],
  blocked: ["removed"],
  removed: [],
};

export const lifecycleMetadataContract = {
  changelogFields: ["version", "date", "summary", "breaking", "migrationNotes"],
  compatibilityWarnings: ["future version", "unsupported schema", "missing checksum", "blocked permission", "unsafe hook"],
  rollbackInstructions: [
    "Disable the pack before removing local files.",
    "Restore previous env vars or component/theme ids.",
    "Clear previewed local inventory entries after removal.",
    "Re-run validation and restart the app after filesystem changes.",
  ],
  updateNoteFields: ["fromVersion", "toVersion", "changes", "operatorAction", "risk"],
} as const;

export const marketplaceLifecycleContract = {
  apiRoute: "/api/marketplace/lifecycle",
  docs: "docs/marketplace-lifecycle.md",
  previewMediaChecks: ["local path", "supported image extension", "screenshot checksum", "no remote URL"],
  schemaVersion: MARKETPLACE_LIFECYCLE_SCHEMA_VERSION,
  states: PACK_LIFECYCLE_STATES,
} as const;

export function canTransitionPackState(from: PackLifecycleState, to: PackLifecycleState) {
  return packLifecycleTransitions[from].includes(to);
}

export function validatePackPreviewMedia(item: Pick<MarketplaceItem, "id" | "screenshots" | "checksums">) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (item.screenshots.length === 0) {
    errors.push(`${item.id} must include at least one screenshot or preview image`);
  }

  for (const screenshot of item.screenshots) {
    if (/^https?:\/\//i.test(screenshot)) errors.push(`${item.id} screenshot must be local: ${screenshot}`);
    if (!/\.(png|jpe?g|webp)$/i.test(screenshot)) warnings.push(`${item.id} screenshot should use png, jpg, jpeg, or webp: ${screenshot}`);
    if (!item.checksums.screenshots?.[screenshot]) warnings.push(`${item.id} screenshot is missing checksum: ${screenshot}`);
  }

  return { errors, valid: errors.length === 0, warnings };
}

export function mapMarketplaceStatusToLifecycleState(status: MarketplaceItemStatus): PackLifecycleState {
  if (status === "built-in") return "enabled";
  if (status === "planned") return "draft";
  if (status === "experimental" || status === "local-only") return "previewed";
  return status;
}

export function createMarketplaceLifecycleReport(items: MarketplaceItem[] = marketplaceItems) {
  const mediaValidation = items.map((item) => ({
    id: item.id,
    ...validatePackPreviewMedia(item),
  }));

  return {
    contract: marketplaceLifecycleContract,
    health: {
      invalidMedia: mediaValidation.filter((item) => !item.valid).length,
      missingMediaChecksums: mediaValidation.filter((item) => item.warnings.some((warning) => warning.includes("missing checksum"))).length,
      totalItems: items.length,
    },
    inventory: items.map((item) => ({
      id: item.id,
      compatibility: item.compatibility,
      kind: item.kind,
      localSource: item.source.path,
      state: mapMarketplaceStatusToLifecycleState(item.status),
      version: item.version,
    })),
    mediaValidation,
    metadata: lifecycleMetadataContract,
    transitions: packLifecycleTransitions,
  };
}
