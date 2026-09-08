export type LayoutCompositionId =
  | "classic-wiki"
  | "docs-portal"
  | "team-knowledge-base"
  | "worldbuilding-atlas"
  | "research-notebook";

export type LayoutCompositionHooks = {
  articleColumns: string;
  categoryLanding: string;
  cssHooks: string[];
  dashboardModules: string[];
  homepageModuleOrder: string[];
  id: LayoutCompositionId;
  rightRail: string;
  shellDensity: "compact" | "comfortable" | "editorial";
};

export const layoutCompositionHooks = [
  {
    id: "classic-wiki",
    shellDensity: "compact",
    homepageModuleOrder: ["featured", "recent", "categories", "activity"],
    articleColumns: "content-first with optional compact metadata rail",
    rightRail: "sticky metadata and backlinks when space allows",
    dashboardModules: ["health", "drafts", "reviews", "recent activity"],
    categoryLanding: "dense article list with category tree context",
    cssHooks: [
      "html[data-layout=\"classic-wiki\"]",
      "html[data-layout=\"classic-wiki\"] .wiki-layout-shell",
      "html[data-layout=\"classic-wiki\"] .wiki-right-rail",
    ],
  },
  {
    id: "docs-portal",
    shellDensity: "comfortable",
    homepageModuleOrder: ["hero docs", "versioned sections", "popular pages", "support links"],
    articleColumns: "docs content with persistent section navigation and status metadata",
    rightRail: "on-page table of contents and last-reviewed details",
    dashboardModules: ["docs freshness", "version drift", "support gaps"],
    categoryLanding: "section cards grouped by product or version",
    cssHooks: [
      "html[data-layout=\"docs-portal\"]",
      "html[data-layout=\"docs-portal\"] .wiki-docs-section",
      "html[data-layout=\"docs-portal\"] .wiki-page-status",
    ],
  },
  {
    id: "team-knowledge-base",
    shellDensity: "comfortable",
    homepageModuleOrder: ["owned pages", "review queue", "team spaces", "onboarding"],
    articleColumns: "handbook content with owner and escalation metadata",
    rightRail: "owners, review cadence, escalation path, and related SOPs",
    dashboardModules: ["stale SOPs", "owner gaps", "review obligations", "onboarding blockers"],
    categoryLanding: "team-owned page groups with review status",
    cssHooks: [
      "html[data-layout=\"team-knowledge-base\"]",
      "html[data-layout=\"team-knowledge-base\"] .wiki-owner-badge",
      "html[data-layout=\"team-knowledge-base\"] .wiki-review-cadence",
    ],
  },
  {
    id: "worldbuilding-atlas",
    shellDensity: "editorial",
    homepageModuleOrder: ["canon highlights", "regions", "timeline", "relations"],
    articleColumns: "lore article with canon, region, and relationship panels",
    rightRail: "canon state, region metadata, timeline position, and relation links",
    dashboardModules: ["canon gaps", "timeline conflicts", "orphaned lore", "map coverage"],
    categoryLanding: "atlas sections by region, era, faction, or narrative arc",
    cssHooks: [
      "html[data-layout=\"worldbuilding-atlas\"]",
      "html[data-layout=\"worldbuilding-atlas\"] .wiki-canon-badge",
      "html[data-layout=\"worldbuilding-atlas\"] .wiki-timeline-card",
    ],
  },
  {
    id: "research-notebook",
    shellDensity: "compact",
    homepageModuleOrder: ["active research", "evidence gaps", "recent notes", "bibliography"],
    articleColumns: "research note with source, confidence, and experiment context",
    rightRail: "citations, confidence, claims, experiments, and bibliography links",
    dashboardModules: ["unreviewed claims", "citation gaps", "experiments", "source backlog"],
    categoryLanding: "research streams grouped by project, source type, or confidence",
    cssHooks: [
      "html[data-layout=\"research-notebook\"]",
      "html[data-layout=\"research-notebook\"] .wiki-citation-panel",
      "html[data-layout=\"research-notebook\"] .wiki-evidence-confidence",
    ],
  },
] satisfies LayoutCompositionHooks[];

const layoutCompositionById = new Map(layoutCompositionHooks.map((layout) => [layout.id, layout]));

export function getLayoutComposition(layoutId: string | undefined): LayoutCompositionHooks {
  return layoutCompositionById.get(layoutId as LayoutCompositionId) ?? layoutCompositionHooks[0];
}

export function validateLayoutComposition(layoutId: string | undefined) {
  const active = getLayoutComposition(layoutId);
  return {
    active,
    fallbackUsed: active.id !== layoutId,
    valid: active.id === layoutId,
  };
}
