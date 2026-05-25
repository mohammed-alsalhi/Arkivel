import { describe, expect, it } from "vitest";
import { marketplaceItems, templatePacks } from "../marketplace";
import { builtInSpaceTemplates } from "../space-templates";
import {
  createTemplateMarketplaceReport,
  diffSpaceTemplates,
  exportTemplateFromSpace,
  templateMarketplaceContract,
} from "../template-marketplace";

describe("template marketplace", () => {
  it("registers template packs in the marketplace", () => {
    expect(templatePacks.map((pack) => pack.kind)).toEqual(["template-pack"]);
    expect(marketplaceItems.some((item) => item.kind === "template-pack")).toBe(true);
    expect(templatePacks[0].includedTemplateIds).toContain("public-documentation");
  });

  it("publishes template pack previews and merge options", () => {
    const report = createTemplateMarketplaceReport();

    expect(report.contract.apiRoute).toBe("/api/marketplace/templates");
    expect(report.previews).toHaveLength(builtInSpaceTemplates.length);
    expect(report.previews[0].includedSchema).toContain("navigation");
    expect(report.mergeOptions.map((option) => option.id)).toContain("skip-conflicts");
  });

  it("diffs templates before merging", () => {
    const diff = diffSpaceTemplates(builtInSpaceTemplates[0], builtInSpaceTemplates[2]);

    expect(diff.categories.added).toContain("docs");
    expect(diff.tags.removed).toContain("personal");
    expect(typeof diff.navigationChanged).toBe("boolean");
  });

  it("exports an existing space shape as a template", () => {
    const exported = exportTemplateFromSpace({
      id: "custom-docs-space",
      name: "Custom Docs Space",
      sourceTemplateId: "product-docs",
    });

    expect(exported.preview.id).toBe("custom-docs-space");
    expect(exported.exportJson).toContain("\"kind\": \"space-template\"");
    expect(templateMarketplaceContract.templatePackKind).toBe("template-pack");
  });
});
