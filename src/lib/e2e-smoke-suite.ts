export const E2E_SMOKE_SCHEMA_VERSION = "arkivel.e2e-smoke-suite.v1";

export const E2E_PRODUCT_SMOKE_FLOWS = [
  "install",
  "login",
  "create-article",
  "edit-article",
  "wiki-links",
  "search",
  "customization",
  "marketplace",
  "export",
  "import-dry-run",
  "plugin-manifest",
  "admin-health",
] as const;

export const E2E_RESPONSIVE_SMOKE_ROUTES = [
  "homepage",
  "article",
  "editor",
  "dashboard",
  "marketplace",
  "customization",
  "help",
] as const;

export const E2E_SMOKE_VIEWPORTS = [
  { height: 844, name: "phone", width: 390 },
  { height: 1024, name: "tablet", width: 768 },
  { height: 900, name: "desktop", width: 1280 },
] as const;

export const e2eSmokeSuiteContract = {
  apiRoute: "/api/e2e-smoke-suite",
  docs: "docs/e2e-smoke-suite.md",
  failureArtifacts: ["screenshots", "traces"],
  playwrightConfig: "playwright.config.ts",
  schemaVersion: E2E_SMOKE_SCHEMA_VERSION,
  seedScript: "scripts/seed-smoke-fixtures.mjs",
  smokeSpec: "e2e/smoke-suite.spec.ts",
} as const;

export function createProductSmokePlan() {
  return E2E_PRODUCT_SMOKE_FLOWS.map((flow) => ({
    flow,
    requiredForV5: true,
  }));
}

export function createResponsiveSmokePlan() {
  return E2E_RESPONSIVE_SMOKE_ROUTES.map((route) => ({
    route,
    requiredViewports: E2E_SMOKE_VIEWPORTS.map((viewport) => viewport.name),
  }));
}

export function createSmokeFixtureSeedPlan() {
  return {
    articles: ["smoke-home", "smoke-linked-target"],
    category: "smoke-fixtures",
    idempotent: true,
    script: e2eSmokeSuiteContract.seedScript,
    user: "smoke-admin",
  };
}

export function createE2eSmokeSuiteReport() {
  return {
    contract: e2eSmokeSuiteContract,
    failureArtifacts: {
      screenshots: "only-on-failure",
      traces: "on-first-retry",
    },
    fixtureSeedPlan: createSmokeFixtureSeedPlan(),
    productSmokePlan: createProductSmokePlan(),
    responsiveSmokePlan: createResponsiveSmokePlan(),
    runCommands: ["npm run qa:seed-smoke", "npm run test:e2e -- e2e/smoke-suite.spec.ts"],
  };
}

export function smokeFlowIsRequired(flow: string) {
  return E2E_PRODUCT_SMOKE_FLOWS.includes(flow as (typeof E2E_PRODUCT_SMOKE_FLOWS)[number]);
}
