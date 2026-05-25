export const TEST_QUALITY_SCHEMA_VERSION = "arkivel.test-quality-gates.v1";

export const TEST_EXPANSION_SURFACES = [
  "unit",
  "integration",
  "api",
  "permission",
  "import-export",
  "customization",
  "marketplace",
  "plugin",
  "editor",
  "responsive",
] as const;

export const STABLE_QA_FIXTURES = [
  "small-wiki",
  "team-wiki",
  "public-docs",
  "worldbuilding-atlas",
  "research-notebook",
  "large-archive",
  "plugin-heavy-install",
] as const;

export const CI_MATRIX_DIMENSIONS = {
  databaseModes: ["postgres-local", "neon-compatible", "restore-rehearsal"],
  featureFlags: ["default", "map-enabled", "trusted-plugins", "offline-pwa"],
  nodeVersions: ["20", "22", "24"],
} as const;

export const KNOWN_WARNING_POLICY = [
  {
    id: "documented-baseline",
    rule: "Known lint/type/test warnings must be listed with owner, reason, and target release.",
  },
  {
    id: "no-new-release-warnings",
    rule: "Release candidates must not introduce new warnings without a known-issue entry.",
  },
  {
    id: "v5-acceptable-risk",
    rule: "Warnings accepted for v5.0.0 need explicit rationale and a follow-up issue.",
  },
] as const;

export const testQualityGatesContract = {
  apiRoute: "/api/test-quality",
  dashboard: "/admin/operations",
  docs: "docs/test-quality-gates.md",
  schemaVersion: TEST_QUALITY_SCHEMA_VERSION,
  surfaces: TEST_EXPANSION_SURFACES,
} as const;

export function createTestExpansionMatrix() {
  return TEST_EXPANSION_SURFACES.map((surface) => ({
    requiredForV5: true,
    surface,
  }));
}

export function createStableFixturePlan() {
  return STABLE_QA_FIXTURES.map((fixture) => ({
    fixture,
    reusableInCi: true,
    seedRequired: true,
  }));
}

export function createQualityDashboardPlan() {
  return {
    sections: [
      "test-suite-status",
      "fixture-coverage",
      "ci-matrix-health",
      "known-warnings",
      "release-blockers",
    ],
    targetAudience: "release-managers",
  };
}

export function createTestQualityReport() {
  return {
    ciMatrix: CI_MATRIX_DIMENSIONS,
    contract: testQualityGatesContract,
    dashboardPlan: createQualityDashboardPlan(),
    fixturePlan: createStableFixturePlan(),
    testExpansionMatrix: createTestExpansionMatrix(),
    warningPolicy: KNOWN_WARNING_POLICY,
  };
}

export function warningRequiresKnownIssue(warningIsNew: boolean) {
  return warningIsNew;
}
