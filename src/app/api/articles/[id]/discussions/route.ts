import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const discussions = await prisma.discussion.findMany({
    where: { articleId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(discussions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { author, content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const discussion = await prisma.discussion.create({
    data: {
      articleId: id,
      author: author?.trim() || "Anonymous",
      content: content.trim(),
    },
  });

  return NextResponse.json(discussion, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const discussionId = searchParams.get("discussionId");

  if (!discussionId) {
    return NextResponse.json({ error: "discussionId is required" }, { status: 400 });
  }

  await prisma.discussion.delete({ where: { id: discussionId } });
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
