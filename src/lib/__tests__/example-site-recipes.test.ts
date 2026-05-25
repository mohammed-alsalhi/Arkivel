import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXAMPLE_SITE_RECIPE_IDS,
  MIGRATION_STORY_IDS,
  V5_READINESS_CHECKS,
  createExampleSiteRecipesReport,
  recipeIsSupported,
} from "../example-site-recipes";

const root = process.cwd();

function readText(file: string) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("example site recipes", () => {
  it("publishes all required example recipes", () => {
    const report = createExampleSiteRecipesReport();

    expect(report.contract.apiRoute).toBe("/api/example-site-recipes");
    expect(report.recipes.map((recipe) => recipe.id)).toEqual(EXAMPLE_SITE_RECIPE_IDS);
    expect(recipeIsSupported("team-handbook")).toBe(true);
    expect(recipeIsSupported("unknown")).toBe(false);
  });

  it("keeps recipes documented with env snippets, screenshots, and recommendations", () => {
    const docs = readText("docs/example-site-recipes.md");
    const examples = readText("examples/recipes/site-recipes.json");

    for (const id of EXAMPLE_SITE_RECIPE_IDS) {
      expect(docs).toContain(id);
      expect(docs).toContain(`NEXT_PUBLIC_ARKIVEL_LAYOUT=${id}`);
      expect(docs).toContain(`docs/screenshots/${id}.png`);
      expect(examples).toContain(id);
    }
  });

  it("documents migration stories and v5 readiness checks", () => {
    const report = createExampleSiteRecipesReport();
    const docs = readText("docs/example-site-recipes.md");

    expect(report.migrationStories.map((story) => story.id)).toEqual(MIGRATION_STORY_IDS);
    expect(report.v5ReadinessChecklist.map((check) => check.id)).toEqual(V5_READINESS_CHECKS);

    for (const id of [...MIGRATION_STORY_IDS, ...V5_READINESS_CHECKS]) {
      expect(docs).toContain(id);
    }
  });
});
