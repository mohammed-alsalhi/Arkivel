export const IN_APP_ONBOARDING_SCHEMA_VERSION = "arkivel.in-app-onboarding.v1";

export const FIRST_RUN_CHECKLIST = [
  "database",
  "admin-account",
  "branding",
  "style",
  "theme",
  "layout",
  "first-space",
  "first-article",
  "backup",
  "security",
] as const;

export const ADMIN_ONBOARDING_GUIDES = [
  "customization",
  "marketplace",
  "templates",
  "plugins",
  "imports",
  "users",
] as const;

export const CONTEXTUAL_HELP_PANELS = [
  { id: "admin-home", route: "/admin", placement: "summary-rail" },
  { id: "customization", route: "/admin/customization", placement: "side-panel" },
  { id: "marketplace", route: "/admin/marketplace", placement: "side-panel" },
  { id: "templates", route: "/space-templates", placement: "inline-panel" },
  { id: "plugins", route: "/admin/plugins", placement: "side-panel" },
  { id: "imports", route: "/admin/maintenance", placement: "collapsible-panel" },
  { id: "users", route: "/admin/users", placement: "collapsible-panel" },
] as const;

export const SAMPLE_CONTENT_PACKS = [
  {
    articles: 4,
    categories: ["Getting started", "Operations", "Examples"],
    id: "demo-starter-knowledge-base",
    path: "examples/onboarding/demo-content-pack.json",
  },
] as const;

export const ONBOARDING_SCREENSHOT_CHECKPOINTS = [
  "first-run-checklist",
  "admin-guided-setup",
  "contextual-help-panel",
  "demo-content-pack-preview",
] as const;

export const inAppOnboardingContract = {
  apiRoute: "/api/in-app-onboarding",
  docs: "docs/in-app-onboarding.md",
  sampleContentPacks: SAMPLE_CONTENT_PACKS.map((pack) => pack.path),
  schemaVersion: IN_APP_ONBOARDING_SCHEMA_VERSION,
} as const;

export function createFirstRunChecklist() {
  return FIRST_RUN_CHECKLIST.map((id, index) => ({
    id,
    order: index + 1,
    requiredForStable: ["database", "admin-account", "backup", "security"].includes(id),
  }));
}

export function createAdminOnboardingGuides() {
  return ADMIN_ONBOARDING_GUIDES.map((id) => ({
    id,
    doc: inAppOnboardingContract.docs,
  }));
}

export function createContextualHelpPlan() {
  return CONTEXTUAL_HELP_PANELS.map((panel) => ({
    ...panel,
    clutterGuard: "collapsed-by-default",
  }));
}

export function createInAppOnboardingReport() {
  return {
    adminGuides: createAdminOnboardingGuides(),
    contextualHelpPanels: createContextualHelpPlan(),
    contract: inAppOnboardingContract,
    firstRunChecklist: createFirstRunChecklist(),
    sampleContentPacks: SAMPLE_CONTENT_PACKS,
    screenshotCheckpoints: ONBOARDING_SCREENSHOT_CHECKPOINTS,
  };
}

export function onboardingStepIsRequired(step: string) {
  return createFirstRunChecklist().some((item) => item.id === step && item.requiredForStable);
}
