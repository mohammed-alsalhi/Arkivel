import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireRole, isAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
        author: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    if (!changeRequest) {
      return NextResponse.json(
        { error: "Change request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(changeRequest);
  } catch (error) {
    console.error("Failed to fetch change request:", error);
    return NextResponse.json(
      { error: "Failed to fetch change request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
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
    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      include: {
        article: {
          select: { id: true, title: true, content: true, contentRaw: true },
        },
      },
    });

    if (!changeRequest) {
      return NextResponse.json(
        { error: "Change request not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status, reviewNote } = body;

    const validStatuses = ["accepted", "rejected", "withdrawn"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Determine authorization based on action
    if (status === "withdrawn") {
      // Author can withdraw their own, admin can withdraw any
      const admin = await isAdmin();
      if (changeRequest.authorId !== session.id && !admin) {
        return NextResponse.json(
          { error: "Only the author or an admin can withdraw this change request" },
          { status: 403 }
        );
      }
    } else {
      // accept/reject requires editor+ role
      const denied = requireRole(session, "editor");
      if (denied) return denied;
    }

    // If accepting, copy content to article and create revision snapshot first
    if (status === "accepted") {
      const article = changeRequest.article;

      // Create revision snapshot of current state before overwriting
      await prisma.articleRevision.create({
        data: {
          articleId: article.id,
          title: article.title,
          content: article.content,
          contentRaw: article.contentRaw || null,
          editSummary: `Before accepting change request: ${changeRequest.title}`,
          userId: session.id,
        },
      });

      // Apply the proposed content to the article
      await prisma.article.update({
        where: { id: article.id },
        data: {
          content: changeRequest.content,
          updatedAt: new Date(),
        },
      });

      await logActivity({
        type: "change_request_accepted",
        userId: session.id,
        articleId: article.id,
        metadata: { changeRequestId: id, title: changeRequest.title },
      });
    }

    const updated = await prisma.changeRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: status !== "withdrawn" ? session.id : undefined,
        reviewNote: reviewNote?.trim() || null,
      },
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
        author: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update change request:", error);
    return NextResponse.json(
      { error: "Failed to update change request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
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
    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      select: { id: true, authorId: true, status: true },
    });

    if (!changeRequest) {
      return NextResponse.json(
        { error: "Change request not found" },
        { status: 404 }
      );
    }

    // Only the author or an admin can delete/withdraw
    const admin = await isAdmin();
    if (changeRequest.authorId !== session.id && !admin) {
      return NextResponse.json(
        { error: "Only the author or an admin can delete this change request" },
        { status: 403 }
      );
    }

    await prisma.changeRequest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete change request:", error);
    return NextResponse.json(
      { error: "Failed to delete change request" },
      { status: 500 }
    );
  }
}
