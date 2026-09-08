import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    totalArticles,
    publishedArticles,
    totalCategories,
    totalTags,
    totalRevisions,
    totalUsers,
    allContent,
    weekRevisions,
    topContributors,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.articleRevision.count(),
    prisma.user.count(),
    prisma.article.findMany({ select: { content: true } }),
    prisma.articleRevision.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      select: { userId: true },
    }),
    prisma.articleRevision.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
      where: { userId: { not: null } },
    }),
  ]);

  const totalWords = allContent.reduce((sum, a) => {
    const words = a.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    return sum + words;
  }, 0);

  const weeklyActiveIds = [...new Set(weekRevisions.map((r) => r.userId).filter(Boolean))];

  const topContributorUsers = await prisma.user.findMany({
    where: { id: { in: topContributors.map((c) => c.userId!).filter(Boolean) } },
    select: { id: true, username: true, displayName: true },
  });
  const userMap = Object.fromEntries(topContributorUsers.map((u) => [u.id, u]));

  const contributors = topContributors
    .filter((c) => c.userId && userMap[c.userId])
    .map((c) => ({
      username: userMap[c.userId!].username,
      displayName: userMap[c.userId!].displayName,
      revisions: c._count.id,
    }));

  return NextResponse.json({
    totalArticles,
    publishedArticles,
    totalCategories,
    totalTags,
    totalRevisions,
    totalUsers,
    totalWords,
    weeklyActiveUsers: weeklyActiveIds.length,
    topContributors: contributors,
  });
}
