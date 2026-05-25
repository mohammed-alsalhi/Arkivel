import { describe, expect, it } from "vitest";
import {
  PACK_LIFECYCLE_STATES,
  canTransitionPackState,
  createMarketplaceLifecycleReport,
  marketplaceLifecycleContract,
  validatePackPreviewMedia,
} from "../marketplace-lifecycle";

describe("marketplace lifecycle", () => {
  it("publishes all lifecycle states and allowed transitions", () => {
    expect(PACK_LIFECYCLE_STATES).toEqual([
      "draft",
      "previewed",
      "installed-local",
      "enabled",
      "disabled",
      "deprecated",
      "incompatible",
      "blocked",
      "removed",
    ]);
    expect(canTransitionPackState("draft", "previewed")).toBe(true);
    expect(canTransitionPackState("enabled", "removed")).toBe(false);
    expect(canTransitionPackState("blocked", "removed")).toBe(true);
  });

  it("creates local inventory and health report", () => {
    const report = createMarketplaceLifecycleReport();

    expect(report.contract.apiRoute).toBe("/api/marketplace/lifecycle");
    expect(report.inventory.length).toBe(report.health.totalItems);
    expect(report.health.invalidMedia).toBe(0);
    expect(report.metadata.rollbackInstructions.length).toBeGreaterThan(0);
  });

  it("validates preview media paths and checksums", () => {
    const valid = validatePackPreviewMedia({
      id: "ok",
      screenshots: ["/marketplace/example.png"],
      checksums: { manifest: "local", screenshots: { "/marketplace/example.png": "local-image" } },
    });
    const invalid = validatePackPreviewMedia({
      id: "bad",
      screenshots: ["https://example.com/preview.svg"],
      checksums: { manifest: "local" },
    });

    expect(valid.valid).toBe(true);
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.join(" ")).toContain("must be local");
    expect(marketplaceLifecycleContract.previewMediaChecks).toContain("screenshot checksum");
  });
});
