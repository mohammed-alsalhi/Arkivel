export const RELEASE_CANDIDATE_ONE_SCHEMA_VERSION = "arkivel.release-candidate-one.v1";

export const RC1_REQUIRED_GATES = [
  "lint",
  "typecheck",
  "tests",
  "build",
  "migration-dry-run",
  "smoke-suite",
  "docs-sync",
] as const;

export const RC1_DEPLOYMENT_PATHS = [
  "vercel",
  "docker",
  "local-node",
  "managed-postgres",
] as const;

export const RC1_VALIDATION_AREAS = [
  "starter-spaces",
  "marketplace-packs",
  "plugin-examples",
  "exports",
  "imports",
  "backups",
  "restores",
] as const;

export const RC1_CHECKLISTS = [
  "accessibility",
  "performance",
  "security",
  "privacy",
] as const;

export const releaseCandidateOneContract = {
  apiRoute: "/api/release-candidate-one",
  docs: "docs/release-candidate-one.md",
  feedbackTemplate: "docs/rc-feedback-template.md",
  schemaVersion: RELEASE_CANDIDATE_ONE_SCHEMA_VERSION,
} as const;

export function createRc1GateEvidence() {
  return RC1_REQUIRED_GATES.map((gate) => ({
    gate,
    evidenceRequired: true,
    status: "required-before-tag",
  }));
}

export function createRc1DeploymentValidation() {
  return RC1_DEPLOYMENT_PATHS.map((path) => ({
    path,
    docs: "docs/setup-paths.md",
    status: "validation-required",
  }));
}

export function createRc1ValidationMatrix() {
  return RC1_VALIDATION_AREAS.map((area) => ({
    area,
    status: "validation-required",
  }));
}

export function createRc1ChecklistMatrix() {
  return RC1_CHECKLISTS.map((checklist) => ({
    checklist,
    releaseBlocking: true,
  }));
}

export function createReleaseCandidateOneReport() {
  return {
    checklists: createRc1ChecklistMatrix(),
    contract: releaseCandidateOneContract,
    deploymentPaths: createRc1DeploymentValidation(),
    feedbackTemplate: releaseCandidateOneContract.feedbackTemplate,
    gateEvidence: createRc1GateEvidence(),
    validationAreas: createRc1ValidationMatrix(),
  };
}

export function rc1GateIsRequired(gate: string) {
  return RC1_REQUIRED_GATES.includes(gate as (typeof RC1_REQUIRED_GATES)[number]);
}
