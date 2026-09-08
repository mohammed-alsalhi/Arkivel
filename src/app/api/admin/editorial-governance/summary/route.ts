import { NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { editorialRiskScore, groupClaimQueueCounts } from "@/lib/editorial-governance";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const now = new Date();

  const [openReviews, overdueReviews, claims, staleVerifications, ownerGaps] = await Promise.all([
    prisma.reviewRequest.count({ where: { status: { in: ["pending", "in_review", "changes_requested"] } } }),
    prisma.reviewRequest.count({
      where: { status: { in: ["pending", "in_review", "changes_requested"] }, dueAt: { not: null, lt: now } },
    }),
    prisma.claimReview.findMany({ select: { status: true, expiresAt: true } }),
    prisma.article.count({
      where: {
        OR: [
          { verificationExpiresAt: { not: null, lt: now } },
          { AND: [{ lastVerifiedAt: null }, { status: "published" }] },
        ],
      },
    }),
    prisma.category.count({
      where: {
        OR: [
          { governance: null },
          { governance: { ownerId: null, ownerLabel: null } },
        ],
      },
    }),
  ]);

  const claimQueues = groupClaimQueueCounts(claims);
  const risk = editorialRiskScore({
    openReviews,
    overdueReviews,
    disputedClaims: claimQueues.disputed,
    staleVerifications,
    ownerGaps,
  });

  return NextResponse.json({
    openReviews,
    overdueReviews,
    claimQueues,
    staleVerifications,
    ownerGaps,
    risk,
    cards: [
      { id: "release-blockers", value: risk.blockers.length, tone: risk.risk },
      { id: "editorial-risk", value: risk.score, tone: risk.risk },
      { id: "claim-queues", value: Object.values(claimQueues).reduce((sum, value) => sum + value, 0), tone: claimQueues.disputed ? "high" : "medium" },
      { id: "verification-renewals", value: staleVerifications, tone: staleVerifications ? "medium" : "low" },
      { id: "owner-gaps", value: ownerGaps, tone: ownerGaps ? "high" : "low" },
    ],
  });
}

export const dynamic = "force-dynamic";

