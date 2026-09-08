import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { isClaimReviewStatus } from "@/lib/claims";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const includeReviewer = {
  reviewer: {
    select: { id: true, username: true, displayName: true },
  },
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  const session = await getSession();

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, published: true, status: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (!article.published && article.status !== "published") {
      const denied = requireRole(session, "editor");
      if (denied) return denied;
    }

    const reviews = await prisma.claimReview.findMany({
      where: { articleId: id },
      orderBy: { updatedAt: "desc" },
      include: includeReviewer,
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Failed to fetch claim reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch claim reviews" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await request.json();
    const { claimHash, claimText, status, note, evidence, expiresAt } = body;

    if (typeof claimHash !== "string" || !claimHash.trim()) {
      return NextResponse.json(
        { error: "claimHash is required" },
        { status: 400 }
      );
    }

    if (typeof claimText !== "string" || !claimText.trim()) {
      return NextResponse.json(
        { error: "claimText is required" },
        { status: 400 }
      );
    }

    if (!isClaimReviewStatus(status)) {
      return NextResponse.json(
        { error: "Invalid claim review status" },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, userId: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const trimmedNote =
      typeof note === "string" && note.trim() ? note.trim() : null;
    const trimmedEvidence =
      typeof evidence === "string" && evidence.trim() ? evidence.trim() : null;
    const trimmedHash = claimHash.trim();
    const trimmedText = claimText.trim();

    const review = await prisma.$transaction(async (tx) => {
      const saved = await tx.claimReview.upsert({
        where: {
          articleId_claimHash: {
            articleId: id,
            claimHash: trimmedHash,
          },
        },
        create: {
          articleId: id,
          claimHash: trimmedHash,
          claimText: trimmedText,
          status,
          note: trimmedNote,
          evidence: trimmedEvidence,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          reviewerId: session!.id,
        },
        update: {
          claimText: trimmedText,
          status,
          note: trimmedNote,
          evidence: trimmedEvidence,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          reviewerId: session!.id,
        },
        include: includeReviewer,
      });

      if (
        article.userId &&
        article.userId !== session!.id &&
        status !== "unreviewed"
      ) {
        const actorName = session!.displayName || session!.username;
        await tx.notification.create({
          data: {
            userId: article.userId,
            articleId: id,
            type: "claim_reviewed",
            message: `${actorName} marked a claim in "${article.title}" as ${status.replace(/_/g, " ")}`,
          },
        });
      }

      return saved;
    });

    await logActivity({
      type: "claim_reviewed",
      userId: session!.id,
      articleId: id,
      metadata: {
        claimHash: trimmedHash,
        status,
      },
    });

    revalidatePath(`/articles/${article.slug}`);

    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to update claim review:", error);
    return NextResponse.json(
      { error: "Failed to update claim review" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
