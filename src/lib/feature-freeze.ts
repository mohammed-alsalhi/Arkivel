export const FEATURE_FREEZE_SCHEMA_VERSION = "arkivel.feature-freeze.v1";

export const FEATURE_FREEZE_ALLOWED_CHANGE_CLASSES = [
  "release-blocker",
  "documentation-gap",
  "migration-fix",
  "security-issue",
  "broken-test",
] as const;

export const FULL_REHEARSAL_AREAS = [
  "install",
  "upgrade",
  "import-export",
  "marketplace",
  "plugin",
  "customization",
  "auth",
  "api",
  "webhook",
  "backup",
  "restore",
  "smoke",
] as const;

export const FEATURE_FREEZE_GATE_OWNERS = [
  "auth",
  "data",
  "customization",
  "marketplace",
  "plugins",
  "api",
  "operations",
  "docs",
  "upgrade",
] as const;

export const RELEASE_NOTE_DRAFT_SECTIONS = [
  "stable-scope",
  "upgrade-notes",
  "breaking-or-risky-changes",
  "self-host-checklist",
  "known-issues",
  "verification-evidence",
] as const;

export const featureFreezeContract = {
  apiRoute: "/api/release-freeze",
  docs: "docs/feature-freeze.md",
  knownIssues: "docs/known-issues.md",
  schemaVersion: FEATURE_FREEZE_SCHEMA_VERSION,
} as const;

export function createFeatureFreezePolicy() {
  return {
    allowedChangeClasses: FEATURE_FREEZE_ALLOWED_CHANGE_CLASSES,
    defaultState: "frozen",
    requiresRoadmapEvidence: true,
  };
}

export function createFullRehearsalMatrix() {
  return FULL_REHEARSAL_AREAS.map((area) => ({
    area,
    evidenceRequired: true,
    status: "ready-for-rc-evidence",
  }));
}

export function createFeatureFreezeGateOwnership() {
  return FEATURE_FREEZE_GATE_OWNERS.map((gate) => ({
    gate,
    owner: "maintainer",
    requiredEvidence: ["test-output", "docs-link", "known-issue-status"],
    status: "tracked",
  }));
}

export function createReleaseNotesDraftPlan() {
  return RELEASE_NOTE_DRAFT_SECTIONS.map((section, index) => ({
    order: index + 1,
    section,
  }));
}

export function createFeatureFreezeReport() {
  return {
    contract: featureFreezeContract,
    gateOwnership: createFeatureFreezeGateOwnership(),
    knownIssuesReport: {
      blockerLabels: ["release-blocker", "security-blocker", "migration-blocker", "docs-blocker", "smoke-blocker"],
      file: featureFreezeContract.knownIssues,
    },
    policy: createFeatureFreezePolicy(),
    releaseNotesDraft: createReleaseNotesDraftPlan(),
    rehearsalMatrix: createFullRehearsalMatrix(),
  };
}

export function changeClassAllowedDuringFreeze(changeClass: string) {
  return FEATURE_FREEZE_ALLOWED_CHANGE_CLASSES.includes(
    changeClass as (typeof FEATURE_FREEZE_ALLOWED_CHANGE_CLASSES)[number],
  );
}
