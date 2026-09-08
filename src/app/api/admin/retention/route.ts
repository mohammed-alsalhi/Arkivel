import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/retention
 * Returns per-article scroll depth stats: avg depth + 10% bucket distribution.
 * Ordered by session count descending. Top 50 articles only.
 */
export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Group scroll depth logs by article
  const grouped = await prisma.scrollDepthLog.groupBy({
    by: ["articleId"],
    _count: { id: true },
    _avg: { depth: true },
    orderBy: { _count: { id: "desc" } },
    take: 50,
  });

  if (grouped.length === 0) return NextResponse.json([]);

  const articleIds = grouped.map((g) => g.articleId);

  // Fetch article titles
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
    select: { id: true, title: true, slug: true },
  });
  const articleMap = Object.fromEntries(articles.map((a) => [a.id, a]));

  // Fetch all logs for these articles to compute bucket distributions
  const logs = await prisma.scrollDepthLog.findMany({
    where: { articleId: { in: articleIds } },
    select: { articleId: true, depth: true },
  });

  // Group logs by articleId
  const logsByArticle: Record<string, number[]> = {};
  for (const log of logs) {
    if (!logsByArticle[log.articleId]) logsByArticle[log.articleId] = [];
    logsByArticle[log.articleId].push(log.depth);
  }

  const result = grouped
    .filter((g) => articleMap[g.articleId])
    .map((g) => {
      const article = articleMap[g.articleId];
      const depths = logsByArticle[g.articleId] ?? [];
      const total = depths.length;

      const buckets = Array.from({ length: 10 }, (_, i) => {
        const from = i * 10;
        const to = from + 10;
        const count = depths.filter((d) => d >= from && d < to).length;
        return { from, to, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
      });

      return {
        articleId: g.articleId,
        title: article.title,
        slug: article.slug,
        sessions: total,
        avgDepth: Math.round(g._avg.depth ?? 0),
        buckets,
      };
    });

  return NextResponse.json(result);
}
