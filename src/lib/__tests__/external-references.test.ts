import { describe, expect, it } from "vitest";
import {
  createExternalReference,
  createExternalReferenceDiagnostics,
  createExternalReferenceReport,
  createProvenanceLabel,
  createPublicIndexPlan,
} from "../external-references";

describe("external references", () => {
  it("creates article, space, source, and imported snapshot metadata", () => {
    const reference = createExternalReference({
      externalId: "article/demo",
      instanceBaseUrl: "https://docs.example.test/",
      instanceId: "docs",
      label: "Demo",
      privacy: "public-indexable",
      relation: "imported-from",
      type: "article",
    });

    expect(reference.canonicalUrl).toBe("https://docs.example.test/external/article/article/demo");
    expect(createProvenanceLabel(reference)).toBe("Imported from Demo");
  });

  it("renders mirrored provenance copy", () => {
    expect(createProvenanceLabel({ label: "Team Handbook", relation: "mirrored-from" })).toBe("Mirrored from Team Handbook");
  });

  it("diagnoses broken and private-leaking external references", () => {
    const diagnostics = createExternalReferenceDiagnostics([
      {
        canonicalUrl: "https://example.test/public-index/private",
        externalId: "private",
        instanceBaseUrl: "https://example.test",
        instanceId: "example",
        label: "Private",
        privacy: "private",
        relation: "references",
        type: "space",
      },
      {
        externalId: "missing-url",
        instanceBaseUrl: "https://example.test",
        instanceId: "example",
        label: "Missing URL",
        privacy: "public-indexable",
        relation: "references",
        type: "source",
      },
    ]);

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toContain("private-index-leak");
    expect(diagnostics.map((diagnostic) => diagnostic.code)).toContain("missing-url");
  });

  it("keeps private references out of public index planning", () => {
    const publicReference = createExternalReference({
      externalId: "public",
      instanceBaseUrl: "https://example.test",
      instanceId: "example",
      label: "Public",
      privacy: "public-indexable",
      relation: "references",
      type: "imported-snapshot",
    });
    const privateReference = createExternalReference({
      externalId: "private",
      instanceBaseUrl: "https://example.test",
      instanceId: "example",
      label: "Private",
      privacy: "sensitive",
      relation: "references",
      type: "article",
    });

    const plan = createPublicIndexPlan([publicReference, privateReference]);
    expect(plan.centralIndex).toBe(false);
    expect(plan.indexable).toHaveLength(1);
    expect(plan.omitted).toEqual([{ externalId: "private", privacy: "sensitive", reason: "privacy level is not public-indexable" }]);
  });

  it("publishes report metadata for API and customization", () => {
    const report = createExternalReferenceReport();

    expect(report.contract.apiRoute).toBe("/api/external-references");
    expect(report.contract.publicIndex.centralIndex).toBe(false);
    expect(report.provenanceLabels).toContain("Imported from Getting Started");
  });
});
