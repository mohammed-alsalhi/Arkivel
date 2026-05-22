import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, isAdmin, requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { isReviewerRole, isReviewStatus, reviewStatusLabel } from "@/lib/reviews";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { id } = await params;

  try {
    const review = await prisma.reviewRequest.findUnique({
      where: { id },
      include: {
        article: {
          select: { id: true, title: true, slug: true, content: true },
        },
        author: {
          select: { id: true, username: true, displayName: true },
        },
        reviewer: {
          select: { id: true, username: true, displayName: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: { id: true, username: true, displayName: true },
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to fetch review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { id } = await params;

  try {
    const review = await prisma.reviewRequest.findUnique({
      where: { id },
      select: {
        id: true,
        articleId: true,
        authorId: true,
        reviewerId: true,
        status: true,
        article: {
          select: { title: true, slug: true, status: true },
        },
        author: {
          select: { username: true, displayName: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, reviewerId, comment } = body;

    if (status && !isReviewStatus(status)) {
      return NextResponse.json(
        { error: "Invalid review status" },
        { status: 400 }
      );
    }

    let reviewer:
      | { id: string; username: string; displayName: string | null; role: string }
      | null = null;
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

    const admin = await isAdmin();
    const isAssignedReviewer = review.reviewerId === session!.id;
    const isAuthor = review.authorId === session!.id;
    const isSelfAssign =
      reviewerId === session!.id &&
      !review.reviewerId &&
      review.status === "pending";
    const isDecision =
      status === "approved" ||
      status === "rejected" ||
      status === "changes_requested";

    if (reviewerId !== undefined && !admin && !isAuthor && !isSelfAssign) {
      return NextResponse.json(
        { error: "Only the author, an admin, or a self-assigned reviewer can change the reviewer" },
        { status: 403 }
      );
    }

    if (isDecision && !admin && !isAssignedReviewer) {
      return NextResponse.json(
        { error: "Only the assigned reviewer or an admin can complete a review" },
        { status: 403 }
      );
    }

    if (status === "in_review" && review.status === "changes_requested" && !admin && !isAuthor) {
      return NextResponse.json(
        { error: "Only the author or an admin can resubmit a review" },
        { status: 403 }
      );
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (reviewerId !== undefined) data.reviewerId = reviewerId || null;

    // If assigning a reviewer and status is pending, move to in_review
    if (reviewerId && !status && review.status === "pending") {
      data.status = "in_review";
    }

    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.reviewRequest.update({
        where: { id },
        data,
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
          comments: {
            orderBy: { createdAt: "asc" },
            include: {
              user: {
                select: { id: true, username: true, displayName: true },
              },
            },
          },
        },
      });

      if (typeof comment === "string" && comment.trim()) {
        const savedComment = await tx.reviewComment.create({
          data: {
            reviewRequestId: id,
            userId: session!.id,
            content: comment.trim(),
          },
          include: {
            user: {
              select: { id: true, username: true, displayName: true },
            },
          },
        });
        saved.comments.push(savedComment);
      }

      if (status === "approved") {
        await tx.article.update({
          where: { id: review.articleId },
          data: { status: "published", published: true },
        });
      } else if (
        (status === "changes_requested" || status === "rejected") &&
        review.article.status === "review"
      ) {
        await tx.article.update({
          where: { id: review.articleId },
          data: { status: "draft", published: false },
        });
      } else if (saved.status === "in_review" && review.article.status === "draft") {
        await tx.article.update({
          where: { id: review.articleId },
          data: { status: "review", published: false },
        });
      }

      const actorName = session!.displayName || session!.username;
      if (reviewerId && reviewerId !== session!.id && reviewerId !== review.reviewerId) {
        await tx.notification.create({
          data: {
            userId: reviewerId,
            articleId: review.articleId,
            type: "review_assigned",
            message: `${actorName} assigned you to review "${review.article.title}"`,
          },
        });
      }

      if (isDecision && review.authorId !== session!.id) {
        await tx.notification.create({
          data: {
            userId: review.authorId,
            articleId: review.articleId,
            type: "review_decision",
            message: `${actorName} marked "${review.article.title}" as ${reviewStatusLabel(status)}`,
          },
        });
      }

      if (
        status === "in_review" &&
        review.status === "changes_requested" &&
        saved.reviewer?.id &&
        saved.reviewer.id !== session!.id
      ) {
        await tx.notification.create({
          data: {
            userId: saved.reviewer.id,
            articleId: review.articleId,
            type: "review_resubmitted",
            message: `${actorName} resubmitted "${review.article.title}" for review`,
          },
        });
      }

      return saved;
    });

    // Log completion
    if (
      status === "approved" ||
      status === "rejected" ||
      status === "changes_requested"
    ) {
      await logActivity({
        type: "review_completed",
        userId: session!.id,
        articleId: review.articleId,
        metadata: { reviewId: id, outcome: status },
      });
    }

    if (updated.article.slug) {
      revalidatePath(`/articles/${updated.article.slug}`);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { id } = await params;

  try {
    const review = await prisma.reviewRequest.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Only the author or an admin can delete
    const admin = await isAdmin();
    if (review.authorId !== session!.id && !admin) {
      return NextResponse.json(
        { error: "Only the author or an admin can delete this review" },
        { status: 403 }
      );
    }

    await prisma.reviewRequest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
