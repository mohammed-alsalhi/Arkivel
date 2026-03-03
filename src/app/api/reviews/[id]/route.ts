import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

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
      select: { id: true, articleId: true, authorId: true, status: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, reviewerId } = body;

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (reviewerId !== undefined) data.reviewerId = reviewerId;

    // If assigning a reviewer and status is pending, move to in_review
    if (reviewerId && !status && review.status === "pending") {
      data.status = "in_review";
    }

    const updated = await prisma.reviewRequest.update({
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
      },
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
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

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
    if (review.authorId !== session.id && !admin) {
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
