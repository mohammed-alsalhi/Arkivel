import {
  builtInSpaceTemplates,
  exportSpaceTemplate,
  previewSpaceTemplate,
  type SpaceTemplate,
} from "./space-templates";

export const TEMPLATE_MARKETPLACE_SCHEMA_VERSION = "2026-05-25.v4.91.1";

export const templateMarketplaceContract = {
  apiRoute: "/api/marketplace/templates",
  docs: "docs/template-marketplace.md",
  exportShape: "space-template",
  mergeOptions: ["append-only", "replace-empty", "skip-conflicts", "metadata-only"],
  previewSections: ["included-schema", "category-tree", "article-templates", "compatibility-notes"],
  schemaVersion: TEMPLATE_MARKETPLACE_SCHEMA_VERSION,
  templatePackKind: "template-pack",
} as const;

export function createTemplatePackPreview(template: SpaceTemplate) {
  const preview = previewSpaceTemplate(template);

  return {
    id: template.id,
    articleTemplatePreview: template.articleTemplates.map((article) => article.title),
    categoryTreePreview: preview.rootCategories,
    compatibility: template.compatibility,
    compatibilityNotes: [
      `Targets Arkivel ${template.compatibility}.`,
      "Preview-only until a future apply flow writes categories, tags, schemas, navigation, and articles.",
    ],
    includedSchema: ["categoryTree", "articleTemplates", "metadataSchema", "infoboxFields", "navigation", "dashboard"],
    previewRoute: template.previewRoute,
  };
}

export function diffSpaceTemplates(left: SpaceTemplate, right: SpaceTemplate) {
  const leftCategories = new Set(flattenCategorySlugs(left.categoryTree));
  const rightCategories = new Set(flattenCategorySlugs(right.categoryTree));
  const leftTags = new Set(left.defaultTags);
  const rightTags = new Set(right.defaultTags);
  const leftFields = new Set(left.metadataSchema.map((field) => field.id));
  const rightFields = new Set(right.metadataSchema.map((field) => field.id));

  return {
    categories: diffSets(leftCategories, rightCategories),
    metadataFields: diffSets(leftFields, rightFields),
    navigationChanged: left.navigation.mode !== right.navigation.mode,
    tags: diffSets(leftTags, rightTags),
  };
}

export function createTemplateMergeOptions() {
  return [
    { id: "append-only", description: "Add missing categories, tags, schemas, and navigation entries without changing existing content." },
    { id: "replace-empty", description: "Replace only empty starter placeholders while preserving edited pages." },
    { id: "skip-conflicts", description: "Preview conflicts and skip matching slugs or schema ids." },
    { id: "metadata-only", description: "Import tags, schemas, infobox fields, navigation, and dashboard metadata without starter articles." },
  ];
}

export function exportTemplateFromSpace(input: {
  id: string;
  name: string;
  sourceTemplateId?: string;
}) {
  const source = builtInSpaceTemplates.find((template) => template.id === input.sourceTemplateId) ?? builtInSpaceTemplates[0];
  const exported: SpaceTemplate = {
    ...source,
    id: input.id,
    name: input.name,
    templatePackId: `${input.id}-template-pack`,
    version: "0.1.0",
  };

  return {
    exportJson: exportSpaceTemplate(exported),
    preview: previewSpaceTemplate(exported),
    template: exported,
  };
}

export function createTemplateMarketplaceReport(templates: SpaceTemplate[] = builtInSpaceTemplates) {
  return {
    contract: templateMarketplaceContract,
    diffExample: diffSpaceTemplates(templates[0], templates[1]),
    exportExample: exportTemplateFromSpace({ id: "exported-space", name: "Exported Space", sourceTemplateId: templates[0]?.id }),
    mergeOptions: createTemplateMergeOptions(),
    previews: templates.map(createTemplatePackPreview),
    templateCount: templates.length,
  };
}

function flattenCategorySlugs(nodes: SpaceTemplate["categoryTree"]): string[] {
  return nodes.flatMap((node) => [node.slug, ...flattenCategorySlugs(node.children ?? [])]);
}

function diffSets(left: Set<string>, right: Set<string>) {
  return {
    added: [...right].filter((item) => !left.has(item)).sort(),
    removed: [...left].filter((item) => !right.has(item)).sort(),
    shared: [...left].filter((item) => right.has(item)).sort(),
  };
}
