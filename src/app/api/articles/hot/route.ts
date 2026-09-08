import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/articles/hot?days=7&limit=10
 *  Returns articles with the most page views in the last N days.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(30, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10)));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  // Compute cutoff date string "YYYY-MM-DD"
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  // Aggregate views per article since cutoff
  const views = await prisma.articleView.groupBy({
    by: ["articleId"],
    where: { date: { gte: cutoffStr } },
    _sum: { count: true },
    orderBy: { _sum: { count: "desc" } },
    take: limit,
  });

  if (views.length === 0) return NextResponse.json([]);

  const articleIds = views.map((v) => v.articleId);
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds }, status: "published" },
    select: { id: true, title: true, slug: true, excerpt: true },
  });

  const articleMap = new Map(articles.map((a) => [a.id, a]));
  const result = views
    .map((v) => {
      const a = articleMap.get(v.articleId);
      if (!a) return null;
      return { ...a, views: v._sum.count ?? 0 };
    })
    .filter(Boolean);

  return NextResponse.json(result);
}
