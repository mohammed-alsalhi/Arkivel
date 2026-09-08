import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET — preview: how many revisions would be pruned */
export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const keep = Math.max(1, parseInt(searchParams.get("keep") ?? "50", 10));

  // Count revisions per article
  const articles = await prisma.article.findMany({
    select: { id: true, title: true, _count: { select: { revisions: true } } },
    where: { revisions: { some: {} } },
  });

  let totalWouldDelete = 0;
  const affected: { id: string; title: string; total: number; wouldDelete: number }[] = [];
  for (const a of articles) {
    if (a._count.revisions > keep) {
      const wouldDelete = a._count.revisions - keep;
      totalWouldDelete += wouldDelete;
      affected.push({ id: a.id, title: a.title, total: a._count.revisions, wouldDelete });
    }
  }

  return NextResponse.json({ keep, totalWouldDelete, affectedArticles: affected.length });
}

/** POST — execute pruning */
export async function POST(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { keep = 50 } = await request.json();
  const keepN = Math.max(1, parseInt(String(keep), 10));

  const articles = await prisma.article.findMany({
    select: { id: true, _count: { select: { revisions: true } } },
    where: { revisions: { some: {} } },
  });

  let totalDeleted = 0;
  for (const a of articles) {
    if (a._count.revisions > keepN) {
      // Find revision IDs to delete (oldest first, keep latest keepN)
      const toDelete = await prisma.articleRevision.findMany({
        where: { articleId: a.id },
        orderBy: { createdAt: "asc" },
        take: a._count.revisions - keepN,
        select: { id: true },
      });
      if (toDelete.length > 0) {
        await prisma.articleRevision.deleteMany({
          where: { id: { in: toDelete.map((r) => r.id) } },
        });
        totalDeleted += toDelete.length;
      }
    }
  }

  return NextResponse.json({ deleted: totalDeleted, keep: keepN });
}
