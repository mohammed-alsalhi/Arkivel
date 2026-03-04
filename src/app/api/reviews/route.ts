import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const reviewerId = searchParams.get("reviewerId");
  const authorId = searchParams.get("authorId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (reviewerId) where.reviewerId = reviewerId;
  if (authorId) where.authorId = authorId;

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
      select: { id: true, title: true },
    });
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const review = await prisma.reviewRequest.create({
      data: {
        articleId,
        authorId: session!.id,
        reviewerId: reviewerId || null,
        message: message || null,
        status: reviewerId ? "in_review" : "pending",
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

    await logActivity({
      type: "review_requested",
      userId: session!.id,
      articleId,
      metadata: { reviewId: review.id, reviewerId },
    });

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
