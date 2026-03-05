import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days ahead

  const [expiredArticles, expiringSoon, reviewOverdue, reviewDueSoon] = await Promise.all([
    prisma.article.findMany({
      where: { expiresAt: { lte: now }, status: { not: "draft" } },
      select: { id: true, title: true, slug: true, expiresAt: true, status: true },
      orderBy: { expiresAt: "asc" },
    }),
    prisma.article.findMany({
      where: { expiresAt: { gt: now, lte: soon }, status: { not: "draft" } },
      select: { id: true, title: true, slug: true, expiresAt: true, status: true },
      orderBy: { expiresAt: "asc" },
    }),
    prisma.article.findMany({
      where: { reviewDueAt: { lte: now } },
      select: { id: true, title: true, slug: true, reviewDueAt: true, status: true },
      orderBy: { reviewDueAt: "asc" },
    }),
    prisma.article.findMany({
      where: { reviewDueAt: { gt: now, lte: soon } },
      select: { id: true, title: true, slug: true, reviewDueAt: true, status: true },
      orderBy: { reviewDueAt: "asc" },
    }),
  ]);

  return NextResponse.json({ expiredArticles, expiringSoon, reviewOverdue, reviewDueSoon });
}

export const dynamic = "force-dynamic";
