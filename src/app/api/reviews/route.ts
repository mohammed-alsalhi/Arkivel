import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import {
  ACTIVE_REVIEW_STATUSES,
  isReviewerRole,
  type ReviewStatus,
} from "@/lib/reviews";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const reviewerId = searchParams.get("reviewerId");
  const authorId = searchParams.get("authorId");
  const articleId = searchParams.get("articleId");
  const active = searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (active === "true") where.status = { in: ACTIVE_REVIEW_STATUSES };
  if (reviewerId) where.reviewerId = reviewerId;
  if (authorId) where.authorId = authorId;
  if (articleId) where.articleId = articleId;

  try {
    const reviews = await prisma.reviewRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
        author: {
          select: { id: true, username: true, displayName: true },
        },
        reviewer: {
          select: { id: true, username: true, displayName: true },
        },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  try {
    const body = await request.json();
    const { articleId, message, reviewerId } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    // Verify article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, slug: true, status: true },
    });
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    let reviewer: { id: string; username: string; displayName: string | null; role: string } | null = null;
    if (reviewerId) {
      reviewer = await prisma.user.findUnique({
        where: { id: reviewerId },
        select: { id: true, username: true, displayName: true, role: true },
      });

      if (!reviewer || !isReviewerRole(reviewer.role)) {
        return NextResponse.json(
          { error: "Reviewer must be an editor or admin" },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.reviewRequest.findFirst({
      where: {
        articleId,
        status: { in: ACTIVE_REVIEW_STATUSES },
      },
      orderBy: { createdAt: "desc" },
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
        author: {
          select: { id: true, username: true, displayName: true },
        },
        reviewer: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This article already has an active review request", review: existing },
        { status: 409 }
      );
    }

    const review = await prisma.$transaction(async (tx) => {
      if (article.status === "draft") {
        await tx.article.update({
          where: { id: articleId },
          data: { status: "review", published: false },
        });
      }

      const created = await tx.reviewRequest.create({
        data: {
          articleId,
          authorId: session!.id,
          reviewerId: reviewerId || null,
          message: typeof message === "string" && message.trim() ? message.trim() : null,
          status: (reviewerId ? "in_review" : "pending") satisfies ReviewStatus,
        },
        include: {
          article: {
            select: { id: true, title: true, slug: true },
          },
          author: {
            select: { id: true, username: true, displayName: true },
          },
          reviewer: {
            select: { id: true, username: true, displayName: true },
          },
        },
      });

      const requesterName = session!.displayName || session!.username;
      if (reviewerId) {
        await tx.notification.create({
          data: {
            userId: reviewerId,
            articleId,
            type: "review_request",
            message: `${requesterName} requested your review on "${article.title}"`,
          },
        });
      } else {
        const reviewers = await tx.user.findMany({
          where: {
            role: { in: ["admin", "editor"] },
            NOT: { id: session!.id },
          },
          select: { id: true },
        });

        if (reviewers.length > 0) {
          await tx.notification.createMany({
            data: reviewers.map((candidate) => ({
              userId: candidate.id,
              articleId,
              type: "review_request",
              message: `${requesterName} requested review on "${article.title}"`,
            })),
          });
        }
      }

      return created;
    });

    await logActivity({
      type: "review_requested",
      userId: session!.id,
      articleId,
      metadata: { reviewId: review.id, reviewerId },
    });

    revalidatePath(`/articles/${article.slug}`);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to create review request:", error);
    return NextResponse.json(
      { error: "Failed to create review request" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
