import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get the user's watchlist article IDs
  const watchlist = await prisma.watchlist.findMany({
    where: { userId: user.id },
    select: { articleId: true },
  });
  if (watchlist.length === 0) return NextResponse.json([]);

  const articleIds = watchlist.map((w) => w.articleId);

  // Revisions in the past 7 days for watched articles
  const revisions = await prisma.articleRevision.findMany({
    where: {
      articleId: { in: articleIds },
      createdAt: { gte: since },
    },
    select: {
      articleId: true,
      createdAt: true,
      user: { select: { username: true, displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (revisions.length === 0) return NextResponse.json([]);

  // Group by article
  const byArticle = new Map<string, typeof revisions>();
  for (const rev of revisions) {
    const list = byArticle.get(rev.articleId) ?? [];
    list.push(rev);
    byArticle.set(rev.articleId, list);
  }

  // Load article metadata
  const articles = await prisma.article.findMany({
    where: { id: { in: [...byArticle.keys()] } },
    select: { id: true, title: true, slug: true },
  });

  const result = articles
    .map((a) => {
      const revs = byArticle.get(a.id) ?? [];
      const editors = [
        ...new Set(revs.map((r) => r.user?.displayName || r.user?.username || "Anonymous")),
      ];
      return {
        articleId: a.id,
        articleTitle: a.title,
        articleSlug: a.slug,
        editCount: revs.length,
        editors,
        lastEdit: revs[0]?.createdAt?.toISOString() ?? "",
      };
    })
    .sort((a, b) => b.editCount - a.editCount);

  return NextResponse.json(result);
}

export const dynamic = "force-dynamic";
