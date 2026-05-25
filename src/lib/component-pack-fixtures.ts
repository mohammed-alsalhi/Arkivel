import type { ComponentSlotId } from "./component-slots";

export type ComponentPackFixture<TSlot extends ComponentSlotId = ComponentSlotId> = {
  data: Record<string, unknown>;
  description: string;
  slot: TSlot;
};

export const componentPackFixtures = [
  {
    slot: "article-card",
    description: "Published article summary used by article-card and search-result previews.",
    data: {
      article: {
        category: "Guides",
        excerpt: "A concise example article used to preview reusable cards.",
        slug: "example-article",
        status: "published",
        tags: ["example", "preview"],
        title: "Example Article",
        updatedAt: "2026-05-25T00:00:00.000Z",
      },
      density: "compact",
      viewerRole: "admin",
    },
  },
  {
    slot: "metadata-panel",
    description: "Article metadata, relations, and governance summary fixture.",
    data: {
      article: { category: "Guides", owner: "Docs Team", reviewDate: "2026-06-30", status: "published" },
      governance: { cadence: "quarterly", reviewer: "Maintainer", risk: "low" },
      relations: [{ label: "Related", target: "release-notes" }],
    },
  },
  {
    slot: "dashboard-widget",
    description: "Dashboard widget fixture for operational pack previews.",
    data: {
      metrics: { stalePages: 4, openReviews: 3, ownerGaps: 1 },
      viewerRole: "admin",
      widget: { id: "content-health", title: "Content Health" },
    },
  },
  {
    slot: "homepage-section",
    description: "Homepage module fixture with articles and categories.",
    data: {
      articles: [{ slug: "example-article", title: "Example Article" }],
      categories: [{ slug: "guides", title: "Guides" }],
      section: { id: "featured", title: "Featured" },
    },
  },
  {
    slot: "space-navigation",
    description: "Category landing fixture for navigation and space previews.",
    data: {
      space: { id: "guides", title: "Guides", visibility: "public" },
      tree: [
        { slug: "getting-started", title: "Getting Started" },
        { slug: "operations", title: "Operations" },
      ],
      viewerRole: "admin",
    },
  },
  {
    slot: "admin-summary",
    description: "Marketplace/admin summary fixture for registry and pack preview surfaces.",
    data: {
      actions: ["validate-pack", "copy-manifest", "open-preview"],
      alerts: [{ severity: "info", title: "Preview only" }],
      summary: { catalogItems: 14, componentPacks: 5, validation: "healthy" },
    },
  },
  {
    slot: "editor-panel",
    description: "Editor panel fixture for command and article-state previews.",
    data: {
      article: { slug: "draft-example", status: "draft", title: "Draft Example" },
      commands: ["insert-template", "request-review", "add-citation"],
      editorState: { mode: "rich-text", unsavedChanges: true },
    },
  },
] satisfies ComponentPackFixture[];
