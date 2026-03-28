import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const limit = Math.min(200, parseInt(searchParams.get("limit") ?? "50", 10));

  if (!userId) {
    // Return list of users with revision counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        createdAt: true,
        _count: { select: { revisions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  }

  // Return revision history for a specific user
  const revisions = await prisma.articleRevision.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      editSummary: true,
      article: { select: { id: true, title: true, slug: true } },
    },
  });

  return NextResponse.json(revisions);
}
