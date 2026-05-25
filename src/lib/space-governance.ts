import type { SessionUser } from "./auth";

export const SPACE_VISIBILITY_MODES = ["inherit", "public", "authenticated", "private", "draft-first"] as const;
export const SPACE_HEALTH_SIGNALS = ["stale-pages", "unreviewed-claims", "orphaned-content", "broken-links"] as const;

export type SpaceVisibilityMode = (typeof SPACE_VISIBILITY_MODES)[number];
export type SpaceHealthSignal = (typeof SPACE_HEALTH_SIGNALS)[number];
export type SpaceGovernanceSource = "global" | "parent-space" | "space";

export type SpaceGovernanceInput = {
  defaultVisibility?: unknown;
  healthRequiredSignals?: unknown;
  healthStaleDays?: unknown;
  ownerId?: unknown;
  ownerLabel?: unknown;
  reviewCadenceDays?: unknown;
  reviewerId?: unknown;
  reviewerLabel?: unknown;
};

export type SpaceGovernanceValues = {
  defaultVisibility: SpaceVisibilityMode | null;
  healthRequiredSignals: SpaceHealthSignal[];
  healthStaleDays: number | null;
  ownerId: string | null;
  ownerLabel: string | null;
  reviewCadenceDays: number | null;
  reviewerId: string | null;
  reviewerLabel: string | null;
};

export type PublicSpaceGovernance = SpaceGovernanceValues & {
  inheritedFrom?: string | null;
  source: SpaceGovernanceSource;
};

export type ResolvedSpaceGovernance = {
  badges: string[];
  chain: PublicSpaceGovernance[];
  effective: PublicSpaceGovernance;
  sources: Record<keyof SpaceGovernanceValues, SpaceGovernanceSource>;
  widgets: SpaceGovernanceWidget[];
};

export type SpaceGovernanceWidget = {
  description: string;
  id: SpaceHealthSignal;
  label: string;
};

export type SpaceGovernanceValidation = {
  errors: string[];
  values: SpaceGovernanceValues;
  valid: boolean;
};

type GovernanceNode = Omit<Partial<SpaceGovernanceValues>, "defaultVisibility" | "healthRequiredSignals"> & {
  defaultVisibility?: SpaceVisibilityMode | string | null;
  healthRequiredSignals?: SpaceHealthSignal[] | string[] | unknown;
  id?: string;
  label?: string | null;
  parentId?: string | null;
};

const valueKeys = [
  "defaultVisibility",
  "healthRequiredSignals",
  "healthStaleDays",
  "ownerId",
  "ownerLabel",
  "reviewCadenceDays",
  "reviewerId",
  "reviewerLabel",
] as const;

export const spaceGovernanceContract = {
  id: "arkivel.space-governance.v1",
  fields: [
    "ownerId",
    "ownerLabel",
    "reviewerId",
    "reviewerLabel",
    "defaultVisibility",
    "reviewCadenceDays",
    "healthStaleDays",
    "healthRequiredSignals",
  ],
  healthSignals: SPACE_HEALTH_SIGNALS,
  precedence: ["global", "parent-space", "space"],
  updateEndpoint: "PUT /api/categories/:id/governance",
  widgets: ["stale-pages", "unreviewed-claims", "orphaned-content", "broken-links"],
};

export function defaultGlobalSpaceGovernance(): SpaceGovernanceValues {
  return {
    defaultVisibility: "public",
    healthRequiredSignals: ["stale-pages", "orphaned-content", "broken-links"],
    healthStaleDays: 90,
    ownerId: null,
    ownerLabel: "Global admins",
    reviewCadenceDays: 90,
    reviewerId: null,
    reviewerLabel: "Editors",
  };
}

export function validateSpaceGovernanceInput(input: SpaceGovernanceInput): SpaceGovernanceValidation {
  const errors: string[] = [];
  const values: SpaceGovernanceValues = {
    defaultVisibility: optionalVisibility(input.defaultVisibility),
    healthRequiredSignals: normalizeSignals(input.healthRequiredSignals),
    healthStaleDays: optionalPositiveInteger(input.healthStaleDays),
    ownerId: optionalString(input.ownerId),
    ownerLabel: optionalString(input.ownerLabel),
    reviewCadenceDays: optionalPositiveInteger(input.reviewCadenceDays),
    reviewerId: optionalString(input.reviewerId),
    reviewerLabel: optionalString(input.reviewerLabel),
  };

  if (input.defaultVisibility !== undefined && input.defaultVisibility !== null && input.defaultVisibility !== "" && !values.defaultVisibility) {
    errors.push(`unsupported defaultVisibility: ${String(input.defaultVisibility)}`);
  }
  if (input.healthRequiredSignals !== undefined && !Array.isArray(input.healthRequiredSignals)) {
    errors.push("healthRequiredSignals must be an array");
  }
  const invalidSignals = Array.isArray(input.healthRequiredSignals)
    ? input.healthRequiredSignals.filter((signal) => !SPACE_HEALTH_SIGNALS.includes(signal as SpaceHealthSignal))
    : [];
  if (invalidSignals.length > 0) errors.push(`unsupported health signals: ${invalidSignals.join(", ")}`);
  if (input.reviewCadenceDays !== undefined && input.reviewCadenceDays !== null && values.reviewCadenceDays === null) {
    errors.push("reviewCadenceDays must be a positive integer");
  }
  if (input.healthStaleDays !== undefined && input.healthStaleDays !== null && values.healthStaleDays === null) {
    errors.push("healthStaleDays must be a positive integer");
  }

  return { errors, valid: errors.length === 0, values };
}

export function resolveSpaceGovernanceInheritance({
  categoryChain,
  globalDefaults,
}: {
  categoryChain: GovernanceNode[];
  globalDefaults: SpaceGovernanceValues;
}): ResolvedSpaceGovernance {
  let resolved = { ...globalDefaults };
  let source: SpaceGovernanceSource = "global";
  const chain: PublicSpaceGovernance[] = [toPublicSpaceGovernance(globalDefaults, "global", "environment")];
  const sources = Object.fromEntries(valueKeys.map((key) => [key, "global"])) as ResolvedSpaceGovernance["sources"];

  for (const node of categoryChain) {
    const nodeSource: SpaceGovernanceSource = node === categoryChain.at(-1) ? "space" : "parent-space";
    const next = mergeGovernance(resolved, node);
    for (const key of next.changedKeys) sources[key] = nodeSource;
    if (next.changed) source = nodeSource;
    resolved = next.values;
    chain.push(toPublicSpaceGovernance(node, nodeSource, node.label ?? node.id ?? null));
  }

  const effective = toPublicSpaceGovernance(resolved, source);

  return {
    badges: governanceBadges(effective),
    chain,
    effective,
    sources,
    widgets: governanceWidgets(effective.healthRequiredSignals),
  };
}

export function toPublicSpaceGovernance(
  values: GovernanceNode | null | undefined,
  source: SpaceGovernanceSource,
  inheritedFrom?: string | null,
): PublicSpaceGovernance {
  return {
    defaultVisibility: optionalVisibility(values?.defaultVisibility) ?? null,
    healthRequiredSignals: normalizeSignals(values?.healthRequiredSignals),
    healthStaleDays: optionalPositiveInteger(values?.healthStaleDays),
    inheritedFrom: inheritedFrom ?? null,
    ownerId: optionalString(values?.ownerId),
    ownerLabel: optionalString(values?.ownerLabel),
    reviewCadenceDays: optionalPositiveInteger(values?.reviewCadenceDays),
    reviewerId: optionalString(values?.reviewerId),
    reviewerLabel: optionalString(values?.reviewerLabel),
    source,
  };
}

export function canEditSpaceGovernance({
  adminSecretConfigured,
  session,
}: {
  adminSecretConfigured: boolean;
  session: Pick<SessionUser, "role"> | null;
}) {
  if (!adminSecretConfigured) return true;
  return session?.role === "admin";
}

function mergeGovernance(base: SpaceGovernanceValues, override: GovernanceNode) {
  let changed = false;
  const changedKeys: (typeof valueKeys)[number][] = [];
  const values = { ...base };

  for (const key of valueKeys) {
    const value =
      key === "defaultVisibility"
        ? optionalVisibility(override[key])
        : key === "healthRequiredSignals"
          ? normalizeSignals(override[key])
          : key === "reviewCadenceDays" || key === "healthStaleDays"
            ? optionalPositiveInteger(override[key])
            : optionalString(override[key]);

    if (Array.isArray(value) ? value.length > 0 : value !== null) {
      values[key] = value as never;
      changed = true;
      changedKeys.push(key);
    }
  }

  return { changed, changedKeys, values };
}

function governanceBadges(values: PublicSpaceGovernance) {
  return [
    values.ownerLabel ? `Owner: ${values.ownerLabel}` : null,
    values.reviewerLabel ? `Reviewer: ${values.reviewerLabel}` : null,
    values.defaultVisibility ? `Visibility: ${values.defaultVisibility}` : null,
    values.reviewCadenceDays ? `Review every ${values.reviewCadenceDays} days` : null,
  ].filter(Boolean) as string[];
}

function governanceWidgets(signals: SpaceHealthSignal[]): SpaceGovernanceWidget[] {
  const labels: Record<SpaceHealthSignal, string> = {
    "broken-links": "Broken Links",
    "orphaned-content": "Orphaned Content",
    "stale-pages": "Stale Pages",
    "unreviewed-claims": "Unreviewed Claims",
  };

  return signals.map((signal) => ({
    description: `Track ${labels[signal].toLowerCase()} for this space and inherited child spaces.`,
    id: signal,
    label: labels[signal],
  }));
}

function normalizeSignals(value: unknown): SpaceHealthSignal[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((signal): signal is SpaceHealthSignal => SPACE_HEALTH_SIGNALS.includes(signal as SpaceHealthSignal))));
}

function optionalPositiveInteger(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function optionalString(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "string" ? value.trim() || null : String(value);
}

function optionalVisibility(value: unknown): SpaceVisibilityMode | null {
  if (value === undefined || value === null || value === "") return null;
  return SPACE_VISIBILITY_MODES.includes(value as SpaceVisibilityMode) ? (value as SpaceVisibilityMode) : null;
}
