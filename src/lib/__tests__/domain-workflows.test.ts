import { describe, expect, it } from "vitest";
import {
  createDomainWorkflowReport,
  domainWorkflowContract,
  domainWorkflows,
  getDomainWorkflow,
} from "../domain-workflows";

describe("domain workflows", () => {
  it("publishes every v4.91.2 workflow", () => {
    expect(domainWorkflows.map((workflow) => workflow.id)).toEqual([
      "docs-portal",
      "team-handbook",
      "worldbuilding",
      "research",
      "personal-wiki",
    ]);
    expect(domainWorkflowContract.apiRoute).toBe("/api/space-workflows");
  });

  it("covers domain-specific controls", () => {
    expect(getDomainWorkflow("docs-portal")?.controls).toContain("versions");
    expect(getDomainWorkflow("team-handbook")?.controls).toContain("acknowledgements");
    expect(getDomainWorkflow("worldbuilding")?.controls).toContain("continuity-checks");
    expect(getDomainWorkflow("research")?.controls).toContain("bibliography-exports");
    expect(getDomainWorkflow("personal-wiki")?.controls).toContain("evergreen-notes");
  });

  it("creates a workflow matrix", () => {
    const report = createDomainWorkflowReport();

    expect(report.matrix).toHaveLength(5);
    expect(report.matrix.every((item) => item.releaseGateCount > 0)).toBe(true);
    expect(report.workflows.every((workflow) => workflow.starterTemplateId)).toBe(true);
  });
});
