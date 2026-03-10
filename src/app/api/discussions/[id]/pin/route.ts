import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;

  // Enforce max 3 pinned comments per article
  const discussion = await prisma.discussion.findUnique({
    where: { id },
    select: { articleId: true, isPinned: true },
  });
  if (!discussion) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!discussion.isPinned) {
    const pinnedCount = await prisma.discussion.count({
      where: { articleId: discussion.articleId, isPinned: true },
    });
    if (pinnedCount >= 3) {
      return NextResponse.json(
        { error: "Maximum 3 pinned comments per article" },
        { status: 422 }
      );
    }
  }

  const updated = await prisma.discussion.update({
    where: { id },
    data: { isPinned: !discussion.isPinned },
  });

  return NextResponse.json({ isPinned: updated.isPinned });
}
