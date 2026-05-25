import { describe, expect, it } from "vitest";
import {
  createMarketplaceAuthoringReport,
  generateMarketplaceCompatibilityMatrix,
  generatePackReadme,
  marketplaceAuthoringContract,
} from "../marketplace-authoring";
import { marketplaceItems } from "../marketplace";

describe("marketplace authoring", () => {
  it("publishes dashboard sections and submission templates", () => {
    const report = createMarketplaceAuthoringReport();

    expect(report.contract.apiRoute).toBe("/api/marketplace/authoring");
    expect(report.dashboard.sections).toContain("local-validation");
    expect(report.dashboard.sections).toContain("docs-completeness");
    expect(report.submissionTemplates.map((template) => template.id)).toContain("marketplace-submission");
    expect(marketplaceAuthoringContract.supportedKinds).toContain("component-pack");
  });

  it("builds authoring health data from marketplace items", () => {
    const report = createMarketplaceAuthoringReport();

    expect(report.metadataPreview.length).toBe(marketplaceItems.length);
    expect(report.screenshotChecks.every((check) => check.valid)).toBe(true);
    expect(report.licenseChecks.every((check) => check.valid)).toBe(true);
    expect(report.docsCompleteness[0]?.requiredSections).toContain("accessibility");
  });

  it("generates readme and compatibility matrix content", () => {
    const item = marketplaceItems[0];
    const readme = generatePackReadme(item);
    const matrix = generateMarketplaceCompatibilityMatrix([item]);

    expect(readme).toContain(`# ${item.name}`);
    expect(readme).toContain("## Quality Checklist");
    expect(matrix[0]).toMatchObject({
      id: item.id,
      supportedInCurrent: item.compatibility !== "future",
    });
  });
});
