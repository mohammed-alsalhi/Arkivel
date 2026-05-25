import packageJson from "../../package.json";
import {
  SUPPORTED_MARKETPLACE_KINDS,
  SUPPORTED_MARKETPLACE_LICENSES,
  createMarketplaceRegistry,
  marketplaceItems,
  type MarketplaceItem,
  type MarketplaceItemKind,
} from "./marketplace";
import { validatePackPreviewMedia } from "./marketplace-lifecycle";

export const MARKETPLACE_AUTHORING_SCHEMA_VERSION = "2026-05-25.v4.90.2";

export const marketplaceAuthoringDashboardSections = [
  "local-validation",
  "metadata-preview",
  "screenshot-checks",
  "license-checks",
  "docs-completeness",
  "compatibility-matrix",
] as const;

export const marketplaceAuthoringChecklist = [
  "Manifest uses a stable kebab-case id, supported kind, semantic version, and explicit compatibility.",
  "README explains purpose, audience, screenshots, configuration, accessibility, performance, security, and testing.",
  "Screenshots are local files with checksums and cover desktop, mobile, empty, loading, and dark-theme states where relevant.",
  "License is one of the supported marketplace licenses and matches bundled assets.",
  "No remote code, install scripts, path traversal, unsafe permissions, or hidden network requirements are included.",
  "Compatibility notes cover Arkivel version, plugin API or component slot assumptions, migrations, and rollback.",
] as const;

export const marketplaceSubmissionTemplates = [
  {
    description: "Markdown issue body for style, color, layout, component, plugin, or theme-pack submissions.",
    id: "marketplace-submission",
    path: "examples/marketplace/submission-template.md",
  },
  {
    description: "README outline generated for local marketplace packs.",
    id: "pack-readme",
    path: "examples/marketplace/pack-readme-template.md",
  },
] as const;

export const marketplaceAuthoringContract = {
  apiRoute: "/api/marketplace/authoring",
  checklist: marketplaceAuthoringChecklist,
  dashboardSections: marketplaceAuthoringDashboardSections,
  docs: "docs/marketplace-authoring.md",
  readmeTemplate: "examples/marketplace/pack-readme-template.md",
  schemaVersion: MARKETPLACE_AUTHORING_SCHEMA_VERSION,
  submissionTemplates: marketplaceSubmissionTemplates,
  supportedKinds: SUPPORTED_MARKETPLACE_KINDS,
  supportedLicenses: SUPPORTED_MARKETPLACE_LICENSES,
} as const;

export function generatePackReadme(item: MarketplaceItem) {
  return [
    `# ${item.name}`,
    "",
    item.description,
    "",
    "## Metadata",
    "",
    `- ID: ${item.id}`,
    `- Kind: ${item.kind}`,
    `- Version: ${item.version}`,
    `- Compatibility: ${item.compatibility}`,
    `- Author: ${item.author}`,
    `- License: ${item.license}`,
    `- Status: ${item.status}`,
    "",
    "## Screenshots",
    "",
    ...item.screenshots.map((screenshot) => `- ${screenshot}`),
    "",
    "## Configuration",
    "",
    "Document env vars, tokens, slots, routes, permissions, and local files required to preview this pack.",
    "",
    "## Quality Checklist",
    "",
    ...marketplaceAuthoringChecklist.map((item) => `- [ ] ${item}`),
  ].join("\n");
}

export function generateMarketplaceCompatibilityMatrix(items: MarketplaceItem[] = marketplaceItems) {
  return items.map((item) => {
    const minimumArkivelVersion = item.compatibility.match(/\d+\.\d+\.\d+/)?.[0] ?? null;

    return {
      id: item.id,
      arkivelVersion: item.compatibility,
      currentVersion: packageJson.version,
      kind: item.kind,
      minimumArkivelVersion,
      notes: item.compatibility === "future"
        ? "Future compatibility target; keep disabled until the matching Arkivel surface exists."
        : "Review with local preview validation before enabling.",
      supportedInCurrent: item.compatibility !== "future",
    };
  });
}

export function createMarketplaceAuthoringReport(items: MarketplaceItem[] = marketplaceItems) {
  const registry = createMarketplaceRegistry(items);
  const screenshotChecks = items.map((item) => ({
    id: item.id,
    kind: item.kind,
    ...validatePackPreviewMedia(item),
  }));
  const licenseChecks = items.map((item) => ({
    id: item.id,
    license: item.license,
    valid: SUPPORTED_MARKETPLACE_LICENSES.includes(item.license),
  }));
  const docsCompleteness = items.map((item) => ({
    id: item.id,
    expectedReadme: `${item.source.path}/README.md`,
    expectedTests: `${item.source.path}/tests/README.md`,
    requiredSections: ["purpose", "configuration", "screenshots", "accessibility", "performance", "security", "testing"],
  }));

  return {
    checklist: marketplaceAuthoringChecklist,
    compatibilityMatrix: generateMarketplaceCompatibilityMatrix(items),
    contract: marketplaceAuthoringContract,
    dashboard: {
      sections: marketplaceAuthoringDashboardSections,
      validationStatus: registry.validation.summary?.status ?? (registry.validation.valid ? "healthy" : "errors"),
    },
    docsCompleteness,
    generators: {
      readme: {
        output: "README.md",
        requiredSections: docsCompleteness[0]?.requiredSections ?? [],
      },
    },
    licenseChecks,
    metadataPreview: items.map((item) => ({
      id: item.id,
      author: item.author,
      compatibility: item.compatibility,
      kind: item.kind as MarketplaceItemKind,
      name: item.name,
      status: item.status,
      version: item.version,
    })),
    registryValidation: registry.validation,
    screenshotChecks,
    submissionTemplates: marketplaceSubmissionTemplates,
  };
}
