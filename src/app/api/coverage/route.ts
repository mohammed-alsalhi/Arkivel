import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/coverage
 * Returns coverage data for all categories: article counts, word counts,
 * link density, and recency score. Used by the Knowledge Coverage Map.
 */
export async function GET() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      _count: { select: { articles: true } },
      articles: {
        where: { status: "published" },
        select: {
          id: true,
          content: true,
          updatedAt: true,
          contentRaw: true,
        },
      },
    },
  });

  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

  const result = categories.map((cat) => {
    const published = cat.articles;
    const totalArticles = published.length;

    // Estimate word count from HTML (strip tags, count words)
    const totalWords = published.reduce((sum, a) => {
      const text = a.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return sum + text.split(" ").length;
    }, 0);

    const avgWords = totalArticles > 0 ? Math.round(totalWords / totalArticles) : 0;

    // Recency: fraction of articles updated in last 30/90 days
    const recentCount = published.filter((a) => now - a.updatedAt.getTime() < THIRTY_DAYS).length;
    const fairlyRecentCount = published.filter((a) => now - a.updatedAt.getTime() < NINETY_DAYS).length;
    const recencyScore = totalArticles > 0
      ? (recentCount * 2 + fairlyRecentCount) / (totalArticles * 3)
      : 0;

    // Coverage score: composite of article count (capped at 20), avg words (capped at 500), recency
    const articleScore = Math.min(totalArticles / 20, 1);
    const wordScore = Math.min(avgWords / 500, 1);
    const coverageScore = Math.round((articleScore * 0.5 + wordScore * 0.3 + recencyScore * 0.2) * 100);

    // Status label
    let status: "empty" | "sparse" | "growing" | "solid" | "rich";
    if (totalArticles === 0) status = "empty";
    else if (totalArticles < 3) status = "sparse";
    else if (totalArticles < 8) status = "growing";
    else if (coverageScore < 60) status = "solid";
    else status = "rich";

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      totalArticles,
      totalWords,
      avgWords,
      recencyScore: Math.round(recencyScore * 100),
      coverageScore,
      status,
    };
  });

  // Sort: empty/sparse first (need attention), then by score
  result.sort((a, b) => {
    const order = { empty: 0, sparse: 1, growing: 2, solid: 3, rich: 4 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.coverageScore - b.coverageScore;
  });

  return NextResponse.json(result);
}
