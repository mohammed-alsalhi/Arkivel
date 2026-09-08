import { describe, expect, it } from "vitest";
import {
  editorialGovernanceContract,
  editorialRiskScore,
  groupClaimQueueCounts,
  isAllowedReviewTransition,
  verificationIsStale,
} from "../editorial-governance";

describe("editorial governance", () => {
  it("publishes review, claim, verification, ownership, and dashboard contracts", () => {
    expect(editorialGovernanceContract.schemaVersion).toBe("arkivel.editorial-governance.v1");
    expect(editorialGovernanceContract.reviewRequests.fields).toContain("approvalThreshold");
    expect(editorialGovernanceContract.claimQueues).toContain("disputed");
    expect(editorialGovernanceContract.dashboardCards).toContain("release-blockers");
  });

  it("validates review status transitions", () => {
    expect(isAllowedReviewTransition("pending", "in_review")).toBe(true);
    expect(isAllowedReviewTransition("approved", "changes_requested")).toBe(false);
  });

  it("groups claim review queues", () => {
    const expired = new Date(Date.now() - 1000).toISOString();
    expect(groupClaimQueueCounts([
      { status: "disputed" },
      { status: "needs_source" },
      { status: "approved", expiresAt: expired },
    ])).toMatchObject({ disputed: 1, needs_source: 1, stale: 1 });
  });

  it("detects stale verification stamps", () => {
    expect(verificationIsStale(new Date(Date.now() - 1000))).toBe(true);
    expect(verificationIsStale(new Date(Date.now() + 1000))).toBe(false);
  });

  it("scores release blockers and editorial risk", () => {
    expect(editorialRiskScore({ openReviews: 1, overdueReviews: 0, disputedClaims: 0, staleVerifications: 0, ownerGaps: 0 }).risk).toBe("low");
    const high = editorialRiskScore({ openReviews: 2, overdueReviews: 2, disputedClaims: 2, staleVerifications: 1, ownerGaps: 1 });
    expect(high.risk).toBe("blocked");
    expect(high.blockers).toContain("overdue reviews");
  });
});
