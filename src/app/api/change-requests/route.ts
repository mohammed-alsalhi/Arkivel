import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const articleId = searchParams.get("articleId");
  const authorId = searchParams.get("authorId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (articleId) where.articleId = articleId;
  if (authorId) where.authorId = authorId;

  try {
    const changeRequests = await prisma.changeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
        author: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    return NextResponse.json(changeRequests);
  } catch (error) {
    console.error("Failed to fetch change requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch change requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const denied = requireRole(session, "viewer");
  if (denied) return denied;

  try {
    const body = await req.json();
    const { articleId, title, description, content } = body;

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "content is required" },
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

    const changeRequest = await prisma.changeRequest.create({
      data: {
        articleId,
        authorId: session!.id,
        title: title.trim(),
        description: description?.trim() || null,
        content: content.trim(),
        status: "open",
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

    await logActivity({
      type: "change_request_opened",
      userId: session!.id,
      articleId,
      metadata: { changeRequestId: changeRequest.id, title: title.trim() },
    });

    return NextResponse.json(changeRequest, { status: 201 });
  } catch (error) {
    console.error("Failed to create change request:", error);
    return NextResponse.json(
      { error: "Failed to create change request" },
      { status: 500 }
    );
  }
}
