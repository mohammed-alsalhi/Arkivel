import { describe, expect, it } from "vitest";
import { createMarketplaceBetaReport, marketplaceBetaContract, marketplaceInstallIntentSteps } from "../marketplace-beta";
import { SUPPORTED_MARKETPLACE_KINDS } from "../marketplace";

describe("marketplace beta", () => {
  it("publishes launch metrics and required marketplace kinds", () => {
    const report = createMarketplaceBetaReport();

    expect(report.contract.apiRoute).toBe("/api/marketplace/beta");
    expect(Object.keys(report.metrics.kindCounts)).toEqual([...SUPPORTED_MARKETPLACE_KINDS]);
    expect(report.metrics.totalItems).toBeGreaterThanOrEqual(SUPPORTED_MARKETPLACE_KINDS.length);
    expect(report.metrics.screenshotCoverage).toBeGreaterThan(0);
  });

  it("publishes featured, recent, recommended, and collection groups", () => {
    const report = createMarketplaceBetaReport();

    expect(report.featured.length).toBeGreaterThan(0);
    expect(report.recentlyUpdated.length).toBeGreaterThan(0);
    expect(report.recommended.layouts.length).toBeGreaterThan(0);
    expect(report.collections.map((collection) => collection.id)).toEqual(["appearance", "components", "plugins"]);
  });

  it("defines search facets and install intent flow", () => {
    const report = createMarketplaceBetaReport();

    expect(marketplaceBetaContract.searchFacets).toEqual(["kind", "tag", "author", "slot", "layout", "permission", "compatibility"]);
    expect(Object.keys(report.searchFacets)).toEqual(expect.arrayContaining(["kind", "tag", "author", "slot", "layout", "permission", "compatibility"]));
    expect(marketplaceInstallIntentSteps.map((step) => step.id)).toEqual(
      ["files", "env", "permissions", "compatibility", "manual-verification"],
    );
  });

  it("publishes compatibility badges and beta limitations", () => {
    const report = createMarketplaceBetaReport();

    expect(report.compatibilityBadges.length).toBe(report.metrics.totalItems);
    expect(report.limitations.join(" ")).toContain("local-first");
  });
});
