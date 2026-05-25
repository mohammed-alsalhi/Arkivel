import { describe, expect, it } from "vitest";
import {
  DISCOVERY_ENGINE_SCHEMA_VERSION,
  buildDiscoveryReport,
  buildTopicClusters,
  detectCanonConflicts,
  detectDuplicatePages,
  detectGlossaryGaps,
  detectOrphanTopics,
  detectUnresolvedQuestions,
  discoveryEngineContract,
} from "../discovery-engines";

const articles = [
  {
    id: "a1",
    title: "Alpha Topic",
    slug: "alpha-topic",
    content: "<p>Alpha Topic is a shared guide. TODO: answer this? [[Beta Topic]] Canon Conflict.</p>",
    category: { name: "Guides", slug: "guides" },
    tags: [{ tag: { name: "Admin", slug: "admin" } }],
  },
  {
    id: "a2",
    title: "Beta Topic",
    slug: "beta-topic",
    content: "<p>Alpha Topic is a shared guide. TODO: answer this? [[Beta Topic]] Canon Conflict.</p>",
    category: { name: "Guides", slug: "guides" },
    tags: [{ tag: { name: "Admin", slug: "admin" } }],
  },
  {
    id: "a3",
    title: "Gamma Topic",
    slug: "gamma-topic",
    content: "<p>Gamma Topic mentions Alpha Topic and Alpha Topic again.</p>",
    category: { name: "Reference", slug: "reference" },
    tags: [],
  },
];

describe("discovery engines", () => {
  it("publishes engine, cluster, module, action, and widget contracts", () => {
    expect(discoveryEngineContract.schemaVersion).toBe(DISCOVERY_ENGINE_SCHEMA_VERSION);
    expect(discoveryEngineContract.engines).toEqual(expect.arrayContaining(["duplicate-page", "unresolved-question", "canon-conflict", "glossary-gap", "orphan-topic"]));
    expect(discoveryEngineContract.adminActions).toContain("seed glossary entry");
    expect(discoveryEngineContract.dashboardWidgets).toContain("orphan topics");
  });

  it("detects discovery opportunities", () => {
    expect(detectDuplicatePages(articles).length).toBeGreaterThan(0);
    expect(detectUnresolvedQuestions(articles).length).toBeGreaterThan(0);
    expect(detectCanonConflicts(articles).length).toBeGreaterThan(0);
    expect(detectGlossaryGaps(articles, ["Beta Topic"]).some((item) => item.description.includes("Alpha Topic"))).toBe(true);
    expect(detectOrphanTopics(articles).some((item) => item.description.includes("Gamma Topic"))).toBe(true);
  });

  it("builds topic clusters and continue reading entries", () => {
    const clusters = buildTopicClusters(articles);
    expect(clusters.find((cluster) => cluster.id === "guides")?.articleCount).toBe(2);
    expect(clusters.find((cluster) => cluster.id === "guides")?.continueReading[0]).toMatchObject({
      href: "/articles/alpha-topic",
    });
  });

  it("builds a dashboard-ready report", () => {
    const report = buildDiscoveryReport(articles, ["Beta Topic"]);
    expect(report.schemaVersion).toBe(DISCOVERY_ENGINE_SCHEMA_VERSION);
    expect(report.summary.opportunities).toBeGreaterThan(0);
    expect(report.widgets.length).toBeGreaterThan(0);
  });
});
