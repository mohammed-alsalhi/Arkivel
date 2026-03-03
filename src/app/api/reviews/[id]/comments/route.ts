import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify the review request exists
    const review = await prisma.reviewRequest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review request not found" },
        { status: 404 }
      );
    }

    const comments = await prisma.reviewComment.findMany({
      where: { reviewRequestId: id },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch review comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch review comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const denied = requireRole(session, "viewer");
  if (denied) return denied;

  const { id } = await params;

  try {
    // Verify the review request exists
    const review = await prisma.reviewRequest.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review request not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { content, selector } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.reviewComment.create({
      data: {
        reviewRequestId: id,
        userId: session!.id,
        content: content.trim(),
        selector: selector || null,
        resolved: false,
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Failed to create review comment:", error);
    return NextResponse.json(
      { error: "Failed to create review comment" },
      { status: 500 }
    );
  }
}
