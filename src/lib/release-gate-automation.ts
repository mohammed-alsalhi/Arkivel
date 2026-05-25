export const RELEASE_GATE_SCHEMA_VERSION = "arkivel.release-gate-automation.v1";

export const RELEASE_CANDIDATE_GATES = [
  "lint",
  "typecheck",
  "unit-tests",
  "api-tests",
  "e2e-smoke-tests",
  "build",
  "migration-dry-run",
  "docs-sync",
] as const;

export const RELEASE_SYNC_FILES = [
  "package.json",
  "package-lock.json",
  "CHANGELOG.md",
  "ROADMAP.md",
  "README.md",
  "docs/help.md",
  "docs/features.md",
  "src/app/help/page.tsx",
  "src/app/features/page.tsx",
  "src/app/api-docs/page.tsx",
] as const;

export const RELEASE_BLOCKER_LABELS = [
  "release-blocker",
  "security-blocker",
  "migration-blocker",
  "docs-blocker",
  "smoke-failure",
] as const;

export const releaseGateAutomationContract = {
  apiRoute: "/api/release-gates",
  checklistGenerator: "createReleaseChecklist",
  docs: "docs/release-gate-automation.md",
  knownIssues: "docs/known-issues.md",
  schemaVersion: RELEASE_GATE_SCHEMA_VERSION,
  syncScript: "scripts/verify-docs-sync.mjs",
} as const;

export function createReleaseGateMatrix() {
  return RELEASE_CANDIDATE_GATES.map((gate) => ({
    gate,
    requiredForReleaseCandidate: true,
  }));
}

export function createReleaseChecklist(version: string) {
  return {
    gates: createReleaseGateMatrix(),
    labels: RELEASE_BLOCKER_LABELS,
    syncFiles: RELEASE_SYNC_FILES,
    version,
  };
}

export function createDocsSyncPlan() {
  return {
    requiredFiles: RELEASE_SYNC_FILES,
    script: releaseGateAutomationContract.syncScript,
    verifies: ["package version", "changelog entry", "roadmap entry", "docs references", "in-app references"],
  };
}

export function createReleaseGateReport(version = "current") {
  return {
    checklist: createReleaseChecklist(version),
    contract: releaseGateAutomationContract,
    docsSync: createDocsSyncPlan(),
    gateMatrix: createReleaseGateMatrix(),
    knownIssueLabels: RELEASE_BLOCKER_LABELS,
  };
}

export function releaseGateIsRequired(gate: string) {
  return RELEASE_CANDIDATE_GATES.includes(gate as (typeof RELEASE_CANDIDATE_GATES)[number]);
}
