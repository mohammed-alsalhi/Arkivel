import { describe, expect, it } from "vitest";
import {
  WORKSPACE_BOOTSTRAP_PROFILES,
  canAccessWorkspace,
  createApiKeyWorkspaceArticleWhere,
  createPublicWorkspaceArticleWhere,
  createWorkspaceArticleWhere,
  createWorkspaceIsolationScenarios,
  getWorkspaceBootstrapPlan,
  getWorkspaceIdFromRequestLike,
  normalizeWorkspaceSlug,
  workspaceContract,
} from "../workspaces";

describe("workspace model", () => {
  it("publishes the v4.82 workspace contract", () => {
    expect(workspaceContract.schemaVersion).toBe("arkivel.workspace.v1");
    expect(workspaceContract.entity).toContain("Wiki");
    expect(workspaceContract.scopedSurfaces).toEqual(
      expect.arrayContaining(["articles", "categories", "tags", "search", "dashboard", "customization", "marketplace"])
    );
  });

  it("defines bootstrap plans for every supported profile", () => {
    for (const profile of WORKSPACE_BOOTSTRAP_PROFILES) {
      const plan = getWorkspaceBootstrapPlan(profile);
      expect(plan.profile).toBe(profile);
      expect(plan.starterSpaces.length).toBeGreaterThan(0);
      expect(plan.settings.marketplaceSelections.componentPackId).toBeTruthy();
    }
  });

  it("falls back to a personal bootstrap profile", () => {
    expect(getWorkspaceBootstrapPlan("unknown").profile).toBe("personal");
  });

  it("normalizes workspace slugs", () => {
    expect(normalizeWorkspaceSlug(" Team Docs! 2026 ")).toBe("team-docs-2026");
  });

  it("reads workspace scope from query or header", () => {
    expect(getWorkspaceIdFromRequestLike({ searchParams: new URLSearchParams("workspaceId=abc") })).toBe("abc");
    expect(getWorkspaceIdFromRequestLike({ searchParams: new URLSearchParams("wikiId=def") })).toBe("def");
    expect(getWorkspaceIdFromRequestLike({ headers: new Headers({ "X-Arkivel-Workspace": "ghi" }) })).toBe("ghi");
  });

  it("builds article isolation filters", () => {
    expect(createWorkspaceArticleWhere({ workspaceId: "wiki_a", includeGlobal: false })).toEqual({ wikiId: "wiki_a" });
    expect(createWorkspaceArticleWhere({ workspaceId: "wiki_a", includeGlobal: true })).toEqual({
      OR: [{ wikiId: "wiki_a" }, { wikiId: null }],
    });
    expect(createWorkspaceArticleWhere({ includeGlobal: false })).toEqual({ wikiId: null });
  });

  it("builds public visibility filters for feeds and sitemaps", () => {
    expect(createPublicWorkspaceArticleWhere()).toEqual({
      OR: [{ wikiId: null }, { wiki: { visibility: "public" } }],
    });
  });

  it("builds API-key readable workspace filters", () => {
    expect(createApiKeyWorkspaceArticleWhere({ userId: "user_1", workspaceId: "wiki_a" })).toEqual({
      AND: [
        { wikiId: "wiki_a" },
        {
          OR: [
            { wiki: { visibility: "public" } },
            { wiki: { memberships: { some: { userId: "user_1", status: "active" } } } },
            { wiki: { ownerId: "user_1" } },
          ],
        },
      ],
    });
  });

  it("documents data isolation scenarios", () => {
    const scenarios = createWorkspaceIsolationScenarios();
    expect(scenarios).toHaveLength(3);
    expect(scenarios[0].hiddenWikiId).toBe("wiki_b");
  });

  it("allows public reads but requires membership for private workspaces", () => {
    expect(canAccessWorkspace({ visibility: "public" })).toBe(true);
    expect(canAccessWorkspace({ visibility: "private" })).toBe(false);
    expect(canAccessWorkspace({ visibility: "private", role: "viewer" })).toBe(true);
  });
});
