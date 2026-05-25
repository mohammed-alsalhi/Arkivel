import packageJson from "../../package.json";
import { componentPacks, layoutPresets } from "./marketplace";

export const SPACE_TEMPLATE_SCHEMA_VERSION = "arkivel.space-template.v1";

export type SpaceTemplateCategoryNode = {
  children?: SpaceTemplateCategoryNode[];
  description?: string;
  name: string;
  slug: string;
};

export type SpaceTemplateArticle = {
  excerpt?: string;
  slug: string;
  status?: "draft" | "review" | "published";
  title: string;
};

export type SpaceTemplateMetadataField = {
  id: string;
  label: string;
  required?: boolean;
  type: "text" | "number" | "date" | "select" | "url" | "relation";
};

export type SpaceTemplateNavigation = {
  mode: "standard" | "docs" | "archive" | "atlas" | "research";
  primary: string[];
  secondary: string[];
};

export type SpaceTemplateDashboard = {
  widgets: string[];
};

export type SpaceTemplate = {
  articleTemplates: SpaceTemplateArticle[];
  author: string;
  categoryTree: SpaceTemplateCategoryNode[];
  compatibility: string;
  componentPackId: string;
  dashboard: SpaceTemplateDashboard;
  defaultTags: string[];
  description: string;
  id: string;
  infoboxFields: SpaceTemplateMetadataField[];
  kind: "space-template";
  layoutId: string;
  license: string;
  metadataSchema: SpaceTemplateMetadataField[];
  name: string;
  navigation: SpaceTemplateNavigation;
  previewRoute: string;
  recommendedPacks: string[];
  sampleMetadata: Record<string, string>;
  schemaVersion: typeof SPACE_TEMPLATE_SCHEMA_VERSION;
  templatePackId?: string;
  version: string;
};

export type SpaceTemplateValidationIssue = {
  code: string;
  message: string;
  severity: "error" | "warning";
};

export type SpaceTemplateValidation = {
  issues: SpaceTemplateValidationIssue[];
  valid: boolean;
};

export type SpaceTemplatePreview = {
  articleTemplateCount: number;
  categoryCount: number;
  compatibility: string;
  defaultTags: string[];
  id: string;
  infoboxFieldCount: number;
  layoutId: string;
  metadataFieldCount: number;
  oneClickImportPreviewRoute: string;
  previewRoute: string;
  recommendedPacks: string[];
  rootCategories: string[];
  sampleMetadataKeys: string[];
  validation: SpaceTemplateValidation;
};

const layoutIds = new Set(layoutPresets.flatMap((layout) => [layout.id, layout.envValue]));
const packIds = new Set(componentPacks.map((pack) => pack.id));
const safeIdPattern = /^[a-z0-9][a-z0-9._-]*[a-z0-9]$/;
const semverPattern = /^\d+\.\d+\.\d+$/;

export const spaceTemplateContract = {
  schemaVersion: SPACE_TEMPLATE_SCHEMA_VERSION,
  kind: "space-template",
  requiredFields: [
    "schemaVersion",
    "id",
    "kind",
    "name",
    "version",
    "compatibility",
    "categoryTree",
    "articleTemplates",
    "metadataSchema",
    "defaultTags",
    "infoboxFields",
    "sampleMetadata",
    "navigation",
    "dashboard",
    "layoutId",
    "componentPackId",
    "recommendedPacks",
  ],
  importPreviewRoute: "/api/space-templates",
  previewRoutePattern: "/space-templates/:id",
  previewOnly: true,
  starterSpaceRelease: "v4.91.0",
  safety: [
    "No executable payloads",
    "No remote code references",
    "No path traversal",
    "No unsupported schema versions",
  ],
};

export const builtInSpaceTemplates: SpaceTemplate[] = [
  createTemplate({
    articleTemplates: ["Home", "Inbox", "Reading Notes", "Weekly Review"],
    categoryTree: [
      node("library", "Library", [node("notes", "Notes"), node("sources", "Sources")]),
      node("projects", "Projects"),
    ],
    componentPackId: "default-wiki-components",
    defaultTags: ["personal", "reference", "review"],
    description: "Personal wiki structure for notes, reading, projects, and weekly review.",
    id: "personal-wiki",
    layoutId: "classic-wiki",
    name: "Personal Wiki",
    recommendedPacks: ["default-wiki-components"],
  }),
  createTemplate({
    articleTemplates: ["Team Handbook", "Onboarding", "Escalation Path", "Weekly Operating Review"],
    categoryTree: [
      node("handbook", "Handbook", [node("policies", "Policies"), node("sops", "SOPs")]),
      node("teams", "Teams"),
    ],
    componentPackId: "team-knowledge-base-components",
    defaultTags: ["owner-required", "review-cadence", "team"],
    description: "Team handbook structure for SOPs, ownership, onboarding, and review cadence.",
    id: "team-handbook",
    layoutId: "team-knowledge-base",
    name: "Team Handbook",
    recommendedPacks: ["team-knowledge-base-components"],
  }),
  createTemplate({
    articleTemplates: ["Getting Started", "API Overview", "Release Notes", "Troubleshooting"],
    categoryTree: [
      node("docs", "Docs", [node("guides", "Guides"), node("api", "API"), node("releases", "Releases")]),
      node("support", "Support"),
    ],
    componentPackId: "docs-portal-components",
    defaultTags: ["docs", "versioned", "support"],
    description: "Product documentation portal with guides, API references, releases, and support pages.",
    id: "product-docs",
    layoutId: "docs-portal",
    name: "Product Docs",
    recommendedPacks: ["docs-portal-components"],
  }),
  createTemplate({
    articleTemplates: ["Canon Overview", "Character Dossier", "Region Guide", "Timeline Event"],
    categoryTree: [
      node("canon", "Canon", [node("characters", "Characters"), node("places", "Places"), node("timeline", "Timeline")]),
      node("lore", "Lore"),
    ],
    componentPackId: "worldbuilding-atlas-components",
    defaultTags: ["canon", "lore", "timeline"],
    description: "Worldbuilding bible for canon, characters, places, factions, and timelines.",
    id: "worldbuilding-bible",
    layoutId: "worldbuilding-atlas",
    name: "Worldbuilding Bible",
    recommendedPacks: ["worldbuilding-atlas-components"],
  }),
  createTemplate({
    articleTemplates: ["Research Question", "Literature Note", "Experiment Log", "Synthesis"],
    categoryTree: [
      node("research", "Research", [node("questions", "Questions"), node("sources", "Sources"), node("experiments", "Experiments")]),
      node("synthesis", "Synthesis"),
    ],
    componentPackId: "research-notebook-components",
    defaultTags: ["citation-needed", "evidence", "research"],
    description: "Research notebook structure for questions, sources, experiments, evidence, and synthesis.",
    id: "research-notebook",
    layoutId: "research-notebook",
    name: "Research Notebook",
    recommendedPacks: ["research-notebook-components"],
  }),
  createTemplate({
    articleTemplates: ["Book Note", "Author Profile", "Reading Queue", "Quote Collection"],
    categoryTree: [
      node("reading", "Reading", [node("books", "Books"), node("authors", "Authors"), node("quotes", "Quotes")]),
      node("queue", "Queue"),
    ],
    componentPackId: "default-wiki-components",
    defaultTags: ["book", "reading", "quote"],
    description: "Reading archive for books, authors, notes, quotes, and reading queues.",
    id: "reading-archive",
    layoutId: "classic-wiki",
    name: "Reading Archive",
    recommendedPacks: ["default-wiki-components", "research-notebook-components"],
  }),
  createTemplate({
    articleTemplates: ["Project Brief", "Decision Record", "Meeting Notes", "Risk Register"],
    categoryTree: [
      node("projects", "Projects", [node("briefs", "Briefs"), node("decisions", "Decisions"), node("meetings", "Meetings")]),
      node("operations", "Operations"),
    ],
    componentPackId: "team-knowledge-base-components",
    defaultTags: ["project", "decision", "owner"],
    description: "Project knowledge base for briefs, decisions, meetings, risks, and operating context.",
    id: "project-knowledge-base",
    layoutId: "team-knowledge-base",
    name: "Project Knowledge Base",
    recommendedPacks: ["team-knowledge-base-components", "docs-portal-components"],
  }),
  createTemplate({
    articleTemplates: ["Documentation Home", "Quickstart", "API Reference", "Known Issues"],
    categoryTree: [
      node("public-docs", "Public Docs", [node("quickstart", "Quickstart"), node("reference", "Reference"), node("updates", "Updates")]),
      node("community", "Community"),
    ],
    componentPackId: "docs-portal-components",
    defaultTags: ["public", "docs", "release-note"],
    description: "Public documentation space for open-source projects, product guides, API references, and known issues.",
    id: "public-documentation",
    layoutId: "docs-portal",
    name: "Public Documentation",
    recommendedPacks: ["docs-portal-components", "default-wiki-components"],
  }),
];

export function validateSpaceTemplate(input: unknown): SpaceTemplateValidation {
  const issues: SpaceTemplateValidationIssue[] = [];
  const template = input as Partial<SpaceTemplate>;

  if (!template || typeof template !== "object") {
    return { issues: [issue("invalid-template", "Template must be an object.")], valid: false };
  }

  if (template.schemaVersion !== SPACE_TEMPLATE_SCHEMA_VERSION) {
    issues.push(issue("unsupported-schema", `Unsupported schemaVersion: ${String(template.schemaVersion)}`));
  }
  if (template.kind !== "space-template") issues.push(issue("unsupported-kind", "kind must be space-template."));
  if (!isSafeId(template.id)) issues.push(issue("invalid-id", "id must be a stable local id."));
  if (!template.version || !semverPattern.test(template.version)) issues.push(issue("invalid-version", "version must be semantic."));
  if (!template.compatibility?.startsWith(">=")) {
    issues.push(issue("invalid-compatibility", "compatibility must declare a minimum Arkivel version."));
  }
  if (template.layoutId && !layoutIds.has(template.layoutId)) issues.push(issue("unknown-layout", `Unknown layoutId: ${template.layoutId}`));
  if (template.componentPackId && !packIds.has(template.componentPackId)) {
    issues.push(issue("unknown-component-pack", `Unknown componentPackId: ${template.componentPackId}`));
  }
  for (const packId of template.recommendedPacks ?? []) {
    if (!packIds.has(packId)) issues.push(issue("unknown-recommended-pack", `Unknown recommended pack: ${packId}`, "warning"));
  }
  if (!Array.isArray(template.categoryTree) || template.categoryTree.length === 0) {
    issues.push(issue("missing-category-tree", "categoryTree must include at least one root category."));
  } else {
    validateCategoryNodes(template.categoryTree, issues);
  }
  validateFields(template.metadataSchema, "metadataSchema", issues);
  validateFields(template.infoboxFields, "infoboxFields", issues);
  if (!Array.isArray(template.articleTemplates)) issues.push(issue("invalid-articles", "articleTemplates must be an array."));
  if (!Array.isArray(template.defaultTags)) issues.push(issue("invalid-tags", "defaultTags must be an array."));
  if (!template.navigation || !Array.isArray(template.navigation.primary)) {
    issues.push(issue("invalid-navigation", "navigation must include primary links."));
  }
  if (!template.dashboard || !Array.isArray(template.dashboard.widgets)) {
    issues.push(issue("invalid-dashboard", "dashboard must include widgets."));
  }
  if (!template.sampleMetadata || typeof template.sampleMetadata !== "object") {
    issues.push(issue("invalid-sample-metadata", "sampleMetadata must be an object."));
  }
  if (hasUnsafeJsonValue(template)) issues.push(issue("unsafe-reference", "Template cannot include remote code references or path traversal."));

  return { issues, valid: issues.every((item) => item.severity !== "error") };
}

export function previewSpaceTemplate(input: unknown): SpaceTemplatePreview {
  const template = input as Partial<SpaceTemplate>;
  const validation = validateSpaceTemplate(input);

  return {
    articleTemplateCount: template.articleTemplates?.length ?? 0,
    categoryCount: Array.isArray(template.categoryTree) ? countCategories(template.categoryTree) : 0,
    compatibility: template.compatibility ?? "",
    defaultTags: template.defaultTags ?? [],
    id: template.id ?? "unknown",
    infoboxFieldCount: template.infoboxFields?.length ?? 0,
    layoutId: template.layoutId ?? "",
    metadataFieldCount: template.metadataSchema?.length ?? 0,
    oneClickImportPreviewRoute: "/api/space-templates",
    previewRoute: template.previewRoute ?? `/space-templates/${template.id ?? "unknown"}`,
    recommendedPacks: template.recommendedPacks ?? [],
    rootCategories: template.categoryTree?.map((category) => category.name) ?? [],
    sampleMetadataKeys: Object.keys(template.sampleMetadata ?? {}),
    validation,
  };
}

export function exportSpaceTemplate(template: SpaceTemplate) {
  return JSON.stringify(template, null, 2);
}

export function importSpaceTemplateJson(json: string) {
  try {
    const template = JSON.parse(json);
    return { preview: previewSpaceTemplate(template), template };
  } catch {
    const validation = { issues: [issue("invalid-json", "Template JSON could not be parsed.")], valid: false };
    return {
      preview: {
        articleTemplateCount: 0,
        categoryCount: 0,
        compatibility: "",
        defaultTags: [],
        id: "unknown",
        infoboxFieldCount: 0,
        layoutId: "",
        metadataFieldCount: 0,
        oneClickImportPreviewRoute: "/api/space-templates",
        previewRoute: "/space-templates/unknown",
        recommendedPacks: [],
        rootCategories: [],
        sampleMetadataKeys: [],
        validation,
      },
      template: null,
    };
  }
}

function createTemplate(config: {
  articleTemplates: string[];
  categoryTree: SpaceTemplateCategoryNode[];
  componentPackId: string;
  defaultTags: string[];
  description: string;
  id: string;
  layoutId: string;
  name: string;
  recommendedPacks: string[];
}): SpaceTemplate {
  return {
    articleTemplates: config.articleTemplates.map((title) => ({
      excerpt: `Starter article for ${config.name}: ${title}.`,
      slug: slugify(title),
      status: "draft",
      title,
    })),
    author: "Arkivel",
    categoryTree: config.categoryTree,
    compatibility: ">=4.79.2",
    componentPackId: config.componentPackId,
    dashboard: {
      widgets: dashboardWidgetsFor(config.id),
    },
    defaultTags: config.defaultTags,
    description: config.description,
    id: config.id,
    infoboxFields: commonFields("infobox"),
    kind: "space-template",
    layoutId: config.layoutId,
    license: "MIT",
    metadataSchema: commonFields("metadata"),
    name: config.name,
    navigation: {
      mode: navigationModeFor(config.layoutId),
      primary: config.categoryTree.map((category) => category.name),
      secondary: config.articleTemplates.slice(0, 3),
    },
    previewRoute: `/space-templates/${config.id}`,
    recommendedPacks: config.recommendedPacks,
    sampleMetadata: {
      owner: "Space owner",
      reviewCadence: "Quarterly",
      status: "Draft",
    },
    schemaVersion: SPACE_TEMPLATE_SCHEMA_VERSION,
    templatePackId: `${config.id}-templates`,
    version: "1.0.0",
  };
}

export function createStarterSpacePreviewPages(templates: SpaceTemplate[] = builtInSpaceTemplates) {
  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    previewRoute: template.previewRoute,
    rootCategories: template.categoryTree.map((category) => category.name),
  }));
}

export function createStarterSpaceImportPreview(id: string, templates: SpaceTemplate[] = builtInSpaceTemplates) {
  const template = templates.find((item) => item.id === id);
  if (!template) {
    return {
      found: false,
      id,
      preview: null,
      oneClickLocalImport: {
        enabled: false,
        reason: "Unknown starter space id.",
      },
    };
  }

  return {
    found: true,
    id,
    preview: previewSpaceTemplate(template),
    oneClickLocalImport: {
      enabled: true,
      method: "POST",
      route: "/api/space-templates",
      templateJson: exportSpaceTemplate(template),
    },
  };
}

function commonFields(scope: "infobox" | "metadata"): SpaceTemplateMetadataField[] {
  return [
    { id: `${scope}.owner`, label: "Owner", type: "text" },
    { id: `${scope}.status`, label: "Status", type: "select" },
    { id: `${scope}.review-date`, label: "Review date", type: "date" },
  ];
}

function node(slug: string, name: string, children?: SpaceTemplateCategoryNode[]): SpaceTemplateCategoryNode {
  return { children, name, slug };
}

function validateCategoryNodes(nodes: SpaceTemplateCategoryNode[], issues: SpaceTemplateValidationIssue[]) {
  for (const category of nodes) {
    if (!category.name?.trim()) issues.push(issue("invalid-category-name", "Category names are required."));
    if (!isSafeId(category.slug)) issues.push(issue("invalid-category-slug", `Invalid category slug: ${category.slug}`));
    if (category.children) validateCategoryNodes(category.children, issues);
  }
}

function validateFields(
  fields: SpaceTemplateMetadataField[] | undefined,
  label: string,
  issues: SpaceTemplateValidationIssue[],
) {
  if (!Array.isArray(fields) || fields.length === 0) {
    issues.push(issue(`missing-${label}`, `${label} must include at least one field.`));
    return;
  }

  for (const field of fields) {
    if (!isSafeId(field.id)) issues.push(issue("invalid-field-id", `Invalid field id: ${field.id}`));
    if (!field.label?.trim()) issues.push(issue("invalid-field-label", `Missing label for field ${field.id}.`));
  }
}

function countCategories(nodes: SpaceTemplateCategoryNode[]): number {
  return nodes.reduce((sum, category) => sum + 1 + countCategories(category.children ?? []), 0);
}

function dashboardWidgetsFor(id: string) {
  const shared = ["recent-updates", "stale-content", "quick-create"];
  const byTemplate: Record<string, string[]> = {
    "personal-wiki": ["inbox", "daily-notes", "reading-list"],
    "product-docs": ["docs-coverage", "version-health", "support-gaps"],
    "public-documentation": ["public-pages", "known-issues", "release-notes"],
    "team-handbook": ["owners", "review-cadence", "onboarding"],
    "worldbuilding-bible": ["canon-status", "timeline", "map-links"],
    "research-notebook": ["citations", "evidence", "experiments"],
    "reading-archive": ["reading-queue", "quotes", "authors"],
    "project-knowledge-base": ["decisions", "risks", "meetings"],
  };

  return byTemplate[id] ?? shared;
}

function navigationModeFor(layoutId: string): SpaceTemplateNavigation["mode"] {
  if (layoutId === "docs-portal") return "docs";
  if (layoutId === "worldbuilding-atlas") return "atlas";
  if (layoutId === "research-notebook") return "research";
  return "standard";
}

function hasUnsafeJsonValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.includes("../") || value.includes("http://") || value.includes("https://") || value.includes("javascript:");
  }
  if (Array.isArray(value)) return value.some(hasUnsafeJsonValue);
  if (value && typeof value === "object") return Object.values(value).some(hasUnsafeJsonValue);
  return false;
}

function isSafeId(value: unknown) {
  return typeof value === "string" && safeIdPattern.test(value);
}

function issue(code: string, message: string, severity: "error" | "warning" = "error"): SpaceTemplateValidationIssue {
  return { code, message, severity };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const spaceTemplateRegistry = {
  contract: spaceTemplateContract,
  importPreviews: builtInSpaceTemplates.map((template) => createStarterSpaceImportPreview(template.id)),
  previewPages: createStarterSpacePreviewPages(),
  schemaVersion: SPACE_TEMPLATE_SCHEMA_VERSION,
  templates: builtInSpaceTemplates,
  validation: {
    arkivelVersion: packageJson.version,
    valid: builtInSpaceTemplates.every((template) => validateSpaceTemplate(template).valid),
  },
};
