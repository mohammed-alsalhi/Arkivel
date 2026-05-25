export const DOMAIN_WORKFLOW_SCHEMA_VERSION = "2026-05-25.v4.91.2";

export type DomainWorkflow = {
  controls: string[];
  id: string;
  name: string;
  releaseGates: string[];
  starterTemplateId: string;
  workflow: string[];
};

export const domainWorkflowContract = {
  apiRoute: "/api/space-workflows",
  docs: "docs/domain-workflows.md",
  schemaVersion: DOMAIN_WORKFLOW_SCHEMA_VERSION,
  workflows: ["docs-portal", "team-handbook", "worldbuilding", "research", "personal-wiki"],
} as const;

export const domainWorkflows: DomainWorkflow[] = [
  {
    id: "docs-portal",
    name: "Docs Portal",
    starterTemplateId: "product-docs",
    controls: ["versions", "changelog-pages", "owners", "reviewed-dates", "public-private-docs"],
    workflow: ["Create versioned docs sections", "Assign owners", "Track reviewed dates", "Publish public pages after visibility review"],
    releaseGates: ["Every public page has an owner", "Release notes link to changed docs", "Private docs stay out of public feeds"],
  },
  {
    id: "team-handbook",
    name: "Team Handbook",
    starterTemplateId: "team-handbook",
    controls: ["policies", "acknowledgements", "owners", "review-cycles", "onboarding-paths"],
    workflow: ["Draft policy pages", "Assign accountable owners", "Schedule review cycles", "Link onboarding paths"],
    releaseGates: ["Critical policies have owners", "Acknowledgement requirements are documented", "Review cadence is visible"],
  },
  {
    id: "worldbuilding",
    name: "Worldbuilding",
    starterTemplateId: "worldbuilding-bible",
    controls: ["canon-status", "timelines", "maps", "factions", "locations", "characters", "continuity-checks"],
    workflow: ["Mark canon status", "Connect locations and factions", "Track timeline events", "Review continuity conflicts"],
    releaseGates: ["Published lore has canon status", "Timeline events link to articles", "Continuity checks list open conflicts"],
  },
  {
    id: "research",
    name: "Research",
    starterTemplateId: "research-notebook",
    controls: ["citations", "evidence", "confidence", "experiments", "literature-notes", "bibliography-exports"],
    workflow: ["Capture literature notes", "Attach evidence confidence", "Log experiments", "Export bibliography-ready references"],
    releaseGates: ["Claims cite sources", "Evidence confidence is set", "Experiment logs include outcomes"],
  },
  {
    id: "personal-wiki",
    name: "Personal Wiki",
    starterTemplateId: "personal-wiki",
    controls: ["inbox", "daily-notes", "reading-list", "projects", "evergreen-notes"],
    workflow: ["Capture into inbox", "Promote notes to projects or evergreen pages", "Review daily notes", "Maintain reading list"],
    releaseGates: ["Inbox has a review cadence", "Projects link decisions", "Evergreen notes have backlinks"],
  },
];

export function createDomainWorkflowReport(workflows: DomainWorkflow[] = domainWorkflows) {
  return {
    contract: domainWorkflowContract,
    matrix: workflows.map((workflow) => ({
      id: workflow.id,
      controls: workflow.controls,
      releaseGateCount: workflow.releaseGates.length,
      starterTemplateId: workflow.starterTemplateId,
      workflowStepCount: workflow.workflow.length,
    })),
    workflows,
  };
}

export function getDomainWorkflow(id: string) {
  return domainWorkflows.find((workflow) => workflow.id === id);
}
