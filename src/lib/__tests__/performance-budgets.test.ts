import { describe, expect, it } from "vitest";
import {
  evaluatePerformanceBudget,
  largeWikiFixtures,
  matchBudgetForPath,
  performanceBudgets,
  performanceBudgetsContract,
  slowQueryDiagnostics,
} from "../performance-budgets";

describe("performance budgets", () => {
  it("publishes required profile surfaces and large-wiki fixtures", () => {
    expect(performanceBudgetsContract.profileSurfaces).toEqual(expect.arrayContaining([
      "article-pages",
      "graph",
      "studio",
      "atlas",
      "trails",
      "search",
      "editor-startup",
      "admin-dashboards",
      "marketplace",
    ]));
    expect(largeWikiFixtures.find((fixture) => fixture.id === "public-docs")?.articles).toBeGreaterThan(5000);
  });

  it("evaluates observed p95 latency against budgets", () => {
    const budget = performanceBudgets.find((item) => item.id === "search");
    expect(budget).toBeDefined();
    expect(evaluatePerformanceBudget(budget!, 300).status).toBe("pass");
    expect(evaluatePerformanceBudget(budget!, budget!.p95Ms + 1).status).toBe("warning");
    expect(evaluatePerformanceBudget(budget!, budget!.p95Ms * 2).status).toBe("fail");
    expect(evaluatePerformanceBudget(budget!, null).status).toBe("unknown");
  });

  it("maps known routes and slow-query diagnostics", () => {
    expect(matchBudgetForPath("/articles/example")?.id).toBe("article-pages");
    expect(matchBudgetForPath("/articles/example/edit")?.id).toBe("editor-startup");
    expect(matchBudgetForPath("/admin/marketplace")?.id).toBe("marketplace");
    expect(slowQueryDiagnostics.map((item) => item.id)).toContain("fallback-like-search");
  });
});
