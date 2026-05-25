export const EDITORIAL_GOVERNANCE_SCHEMA_VERSION = "arkivel.editorial-governance.v1";

export const REVIEW_GOVERNANCE_STATUSES = [
  "pending",
  "in_review",
  "approved",
  "changes_requested",
  "rejected",
] as const;

export const CLAIM_QUEUE_STATUSES = [
  "disputed",
  "needs_source",
  "stale",
  "rejected",
  "unreviewed",
] as const;

export type ClaimQueueStatus = (typeof CLAIM_QUEUE_STATUSES)[number];

export type GovernanceRisk = "low" | "medium" | "high" | "blocked";

export const editorialGovernanceContract = {
  schemaVersion: EDITORIAL_GOVERNANCE_SCHEMA_VERSION,
  reviewRequests: {
    fields: ["dueAt", "requiredReviewerIds", "approvalThreshold", "cycleCount", "decisionNote"],
    statusTransitions: {
      pending: ["in_review", "rejected"],
      in_review: ["approved", "changes_requested", "rejected"],
      changes_requested: ["in_review", "rejected"],
      approved: [],
      rejected: ["pending"],
    },
  },
  claimQueues: CLAIM_QUEUE_STATUSES,
  verificationStamps: {
    fields: ["lastVerifiedAt", "lastVerifiedById", "verificationEvidence", "verificationExpiresAt"],
    renewalRule: "Verification is stale when verificationExpiresAt is in the past.",
  },
  ownershipAndEscalation: {
    article: ["userId", "coAuthors", "reviewer", "lastVerifiedById"],
    categorySpace: ["SpaceGovernance.ownerId", "SpaceGovernance.reviewerId"],
    template: ["space template author metadata", "marketplace author metadata"],
  },
  dashboardCards: ["release-blockers", "editorial-risk", "claim-queues", "verification-renewals", "owner-gaps"],
};

export function isAllowedReviewTransition(from: string, to: string): boolean {
  const transitions = editorialGovernanceContract.reviewRequests.statusTransitions as Record<string, string[]>;
  return transitions[from]?.includes(to) ?? false;
}

export function claimQueueForStatus(status: string, expiresAt?: Date | string | null): ClaimQueueStatus | null {
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return "stale";
  if (CLAIM_QUEUE_STATUSES.includes(status as ClaimQueueStatus)) return status as ClaimQueueStatus;
  return null;
}

export function verificationIsStale(expiresAt?: Date | string | null): boolean {
  return Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
}

export function editorialRiskScore(input: {
  openReviews: number;
  overdueReviews: number;
  disputedClaims: number;
  staleVerifications: number;
  ownerGaps: number;
}): { score: number; risk: GovernanceRisk; blockers: string[] } {
  const score =
    input.openReviews +
    input.overdueReviews * 2 +
    input.disputedClaims * 2 +
    input.staleVerifications +
    input.ownerGaps * 2;
  const blockers = [
    input.overdueReviews > 0 ? "overdue reviews" : null,
    input.disputedClaims > 0 ? "disputed claims" : null,
    input.ownerGaps > 0 ? "owner gaps" : null,
  ].filter(Boolean) as string[];
  const risk: GovernanceRisk = score >= 12 ? "blocked" : score >= 7 ? "high" : score >= 3 ? "medium" : "low";
  return { score, risk, blockers };
}

export function groupClaimQueueCounts(claims: Array<{ status: string; expiresAt?: Date | string | null }>) {
  const counts = Object.fromEntries(CLAIM_QUEUE_STATUSES.map((status) => [status, 0])) as Record<ClaimQueueStatus, number>;
  for (const claim of claims) {
    const queue = claimQueueForStatus(claim.status, claim.expiresAt);
    if (queue) counts[queue] += 1;
  }
  return counts;
}

