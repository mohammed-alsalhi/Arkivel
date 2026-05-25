import { describe, expect, it } from "vitest";
import {
  SYNC_ENTITY_TYPES,
  createSignedSnapshotPlan,
  createSyncDryRunReport,
  createSyncManifest,
  createSyncManifestReport,
} from "../sync-manifests";

const source = { baseUrl: "https://staging.example.test", instanceId: "source", name: "Source" };
const target = { baseUrl: "https://prod.example.test", instanceId: "target", name: "Target" };

describe("sync manifests", () => {
  it("builds a schema-versioned manifest with checksums, endpoints, and visibility rules", () => {
    const manifest = createSyncManifest({
      createdAt: "2026-05-25T00:00:00.000Z",
      entities: {
        articles: { count: 2, payload: "article-a/article-b", visibility: ["public-only", "authenticated"] },
      },
      source,
      target,
    });

    expect(manifest.schemaVersion).toBe("arkivel.sync-manifest.v1");
    expect(manifest.source).toEqual(source);
    expect(manifest.target).toEqual(target);
    expect(manifest.checksums.algorithm).toBe("sha256");
    expect(manifest.checksums.sections.articles).toHaveLength(64);
    expect(manifest.entities.map((entity) => entity.type)).toEqual(SYNC_ENTITY_TYPES);
    expect(manifest.visibilityRules).toContain("private-space");
  });

  it("summarizes dry-run sync sections and conflicts without allowing writes", () => {
    const report = createSyncDryRunReport({
      articles: {
        creates: 3,
        conflicts: [{ action: "block", code: "slug", message: "Slug exists", type: "slug-collision" }],
        updates: 2,
      },
      comments: { conflicts: [{ action: "manual-review", code: "thread", message: "Thread diverged", type: "revision-history-divergence" }] },
    });

    expect(report.dryRunOnly).toBe(true);
    expect(report.sections.assets).toBeDefined();
    expect(report.summary.creates).toBe(3);
    expect(report.summary.updates).toBe(2);
    expect(report.summary.blocked).toBe(true);
    expect(report.summary.manualReview).toBe(1);
  });

  it("plans signed snapshots differently for public replicas and private mirrors", () => {
    const publicReplica = createSignedSnapshotPlan("public-read-replica");
    const privateMirror = createSignedSnapshotPlan("private-mirror");

    expect(publicReplica.manifestSignature.required).toBe(true);
    expect(publicReplica.visibility).toEqual(["public-only"]);
    expect(privateMirror.includes).toContain("revisions");
    expect(privateMirror.visibility).toContain("private-space");
  });

  it("publishes the contract, docs, and federation release gate", () => {
    const report = createSyncManifestReport();

    expect(report.contract.apiRoute).toBe("/api/sync-manifests");
    expect(report.contract.docs).toBe("docs/sync-manifests.md");
    expect(report.contract.networkFederation.stableScope).toBe(false);
    expect(report.stagingPromotionChecklist.join(" ")).toContain("production");
  });
});
