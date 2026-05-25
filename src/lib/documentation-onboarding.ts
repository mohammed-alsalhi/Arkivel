export const DOCUMENTATION_ONBOARDING_SCHEMA_VERSION = "arkivel.documentation-onboarding.v1";

export const MAINTAINER_DOC_TOPICS = [
  "install",
  "upgrade",
  "deployment",
  "customization",
  "marketplace",
  "plugin",
  "api",
  "security",
  "backup",
  "contribution",
] as const;

export const SETUP_PATHS = [
  "vercel",
  "docker",
  "local-node",
  "managed-postgres",
  "private-team",
  "public-docs",
  "personal-wiki",
  "demo-instance",
] as const;

export const TROUBLESHOOTING_TOPICS = [
  "database",
  "build",
  "auth",
  "env-vars",
  "uploads",
  "plugins",
  "marketplace-packs",
  "migrations",
] as const;

export const DOCS_IA_REFERENCES = [
  "README.md",
  "docs/index.md",
  "docs/help.md",
  "docs/features.md",
  "src/app/api-docs/page.tsx",
  "ARCHITECTURE.md",
  "DESIGN.md",
  "ROADMAP.md",
] as const;

export const documentationOnboardingContract = {
  apiRoute: "/api/documentation-onboarding",
  docs: "docs/maintainer-guide.md",
  index: "docs/index.md",
  schemaVersion: DOCUMENTATION_ONBOARDING_SCHEMA_VERSION,
  setupPaths: "docs/setup-paths.md",
  troubleshooting: "docs/troubleshooting.md",
} as const;

export function createMaintainerDocsPlan() {
  return MAINTAINER_DOC_TOPICS.map((topic) => ({
    doc: documentationOnboardingContract.docs,
    topic,
  }));
}

export function createSetupPathPlan() {
  return SETUP_PATHS.map((path) => ({
    path,
    targetDoc: documentationOnboardingContract.setupPaths,
  }));
}

export function createTroubleshootingPlan() {
  return TROUBLESHOOTING_TOPICS.map((topic) => ({
    targetDoc: documentationOnboardingContract.troubleshooting,
    topic,
  }));
}

export function createDocsIaReviewPlan() {
  return DOCS_IA_REFERENCES.map((file) => ({
    file,
    shouldLinkToDocsIndex: file !== "docs/index.md",
  }));
}

export function createDocumentationOnboardingReport() {
  return {
    contract: documentationOnboardingContract,
    docsIaReview: createDocsIaReviewPlan(),
    linkTests: {
      practicalScope: ["docs/index.md", "docs/maintainer-guide.md", "docs/setup-paths.md", "docs/troubleshooting.md"],
      testFile: "src/lib/__tests__/documentation-onboarding.test.ts",
    },
    maintainerDocs: createMaintainerDocsPlan(),
    setupPaths: createSetupPathPlan(),
    troubleshooting: createTroubleshootingPlan(),
  };
}

export function docsTopicIsCovered(topic: string) {
  return MAINTAINER_DOC_TOPICS.includes(topic as (typeof MAINTAINER_DOC_TOPICS)[number])
    || SETUP_PATHS.includes(topic as (typeof SETUP_PATHS)[number])
    || TROUBLESHOOTING_TOPICS.includes(topic as (typeof TROUBLESHOOTING_TOPICS)[number]);
}
