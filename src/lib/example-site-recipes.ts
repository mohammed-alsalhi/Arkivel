export const EXAMPLE_SITE_RECIPES_SCHEMA_VERSION = "arkivel.example-site-recipes.v1";

export const EXAMPLE_SITE_RECIPE_IDS = [
  "personal-wiki",
  "team-handbook",
  "public-docs",
  "worldbuilding-atlas",
  "research-library",
  "read-only-archive",
  "product-knowledge-base",
] as const;

export const MIGRATION_STORY_IDS = [
  "notion",
  "obsidian",
  "mediawiki",
  "markdown-folders",
  "docs-sites",
] as const;

export const V5_READINESS_CHECKS = [
  "auth-and-roles",
  "backup-and-restore",
  "migration-dry-run",
  "customization-manifest",
  "marketplace-and-plugins",
  "public-api-v1",
  "webhooks-and-feeds",
  "security-and-privacy",
  "smoke-suite",
  "docs-sync",
] as const;

export const exampleSiteRecipesContract = {
  apiRoute: "/api/example-site-recipes",
  docs: "docs/example-site-recipes.md",
  examples: "examples/recipes/site-recipes.json",
  schemaVersion: EXAMPLE_SITE_RECIPES_SCHEMA_VERSION,
} as const;

const recipeDisplayNames: Record<(typeof EXAMPLE_SITE_RECIPE_IDS)[number], string> = {
  "personal-wiki": "Personal wiki",
  "team-handbook": "Team handbook",
  "public-docs": "Public docs",
  "worldbuilding-atlas": "Worldbuilding atlas",
  "research-library": "Research library",
  "read-only-archive": "Read-only archive",
  "product-knowledge-base": "Product knowledge base",
};

export function createExampleSiteRecipes() {
  return EXAMPLE_SITE_RECIPE_IDS.map((id) => ({
    id,
    name: recipeDisplayNames[id],
    envSnippet: `NEXT_PUBLIC_ARKIVEL_LAYOUT=${id}`,
    marketplaceRecommendations: ["default-wiki", "docs-portal", "team-knowledge-base"].slice(0, id === "personal-wiki" ? 1 : 3),
    screenshot: `docs/screenshots/${id}.png`,
    templateRecommendation: id,
  }));
}

export function createMigrationStories() {
  return MIGRATION_STORY_IDS.map((id) => ({
    id,
    doc: exampleSiteRecipesContract.docs,
    rehearsalRequired: true,
  }));
}

export function createV5ReadinessChecklist() {
  return V5_READINESS_CHECKS.map((id, index) => ({
    id,
    order: index + 1,
    releaseBlocking: true,
  }));
}

export function createExampleSiteRecipesReport() {
  return {
    contract: exampleSiteRecipesContract,
    migrationStories: createMigrationStories(),
    recipes: createExampleSiteRecipes(),
    v5ReadinessChecklist: createV5ReadinessChecklist(),
  };
}

export function recipeIsSupported(id: string) {
  return EXAMPLE_SITE_RECIPE_IDS.includes(id as (typeof EXAMPLE_SITE_RECIPE_IDS)[number]);
}
