import prisma from "@/lib/prisma";

export interface MetricsSummary {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  totalTags: number;
  totalRevisions: number;
  totalDiscussions: number;
  recentEdits24h: number;
  recentArticles24h: number;
  topCategories: { name: string; slug: string; count: number }[];
  articlesByMonth: { month: string; count: number }[];
  timestamp: string;
}

export async function getMetricsSummary(): Promise<MetricsSummary> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    totalCategories,
    totalTags,
    totalRevisions,
    totalDiscussions,
    recentEdits24h,
    recentArticles24h,
    categoriesWithCounts,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.article.count({ where: { status: "draft" } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.articleRevision.count(),
    prisma.discussion.count(),
    prisma.articleRevision.count({
      where: { createdAt: { gte: twentyFourHoursAgo } },
    }),
    prisma.article.count({
      where: { createdAt: { gte: twentyFourHoursAgo } },
    }),
    prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { articles: true } },
      },
      orderBy: { articles: { _count: "desc" } },
      take: 10,
    }),
  ]);

  const topCategories = categoriesWithCounts.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c._count.articles,
  }));

  // Get articles created per month for the last 6 months
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
  const recentArticles = await prisma.article.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const monthCounts: Record<string, number> = {};
  for (const article of recentArticles) {
    const key = article.createdAt.toISOString().substring(0, 7); // YYYY-MM
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  }

  const articlesByMonth = Object.entries(monthCounts).map(([month, count]) => ({
    month,
    count,
  }));

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    totalCategories,
    totalTags,
    totalRevisions,
    totalDiscussions,
    recentEdits24h,
    recentArticles24h,
    topCategories,
    articlesByMonth,
    timestamp: now.toISOString(),
  };
}
