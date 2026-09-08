import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Weekly change digest cron endpoint.
 * For each watched article that had revisions in the past 7 days,
 * creates a Notification for each watcher summarising the changes.
 *
 * Call with: POST /api/cron/digest
 * Protected by x-cron-secret header.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find articles that have revisions in the last 7 days AND are watched by someone
  const recentRevisions = await prisma.articleRevision.findMany({
    where: { createdAt: { gte: since } },
    select: {
      articleId: true,
      createdAt: true,
      userId: true,
      user: { select: { username: true, displayName: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (recentRevisions.length === 0) {
    return NextResponse.json({ notified: 0 });
  }

  // Group revisions by article
  const byArticle = new Map<string, typeof recentRevisions>();
  for (const rev of recentRevisions) {
    const list = byArticle.get(rev.articleId) ?? [];
    list.push(rev);
    byArticle.set(rev.articleId, list);
  }

  const articleIds = [...byArticle.keys()];

  // Load articles and their watchers
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      watchedBy: { select: { userId: true } },
    },
  });

  let notified = 0;

  for (const article of articles) {
    const revs = byArticle.get(article.id) ?? [];
    if (revs.length === 0 || article.watchedBy.length === 0) continue;

    const editCount = revs.length;
    const editors = [...new Set(revs.map((r) => r.user?.displayName || r.user?.username || "Someone"))];
    const message =
      `Weekly digest: "${article.title}" had ${editCount} edit${editCount !== 1 ? "s" : ""} ` +
      `in the past 7 days by ${editors.slice(0, 3).join(", ")}${editors.length > 3 ? ` and ${editors.length - 3} others` : ""}.`;

    // Create one notification per watcher (skip if they already have an unread digest for this article)
    for (const { userId } of article.watchedBy) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          articleId: article.id,
          type: "digest",
          read: false,
          createdAt: { gte: since },
        },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId,
          articleId: article.id,
          type: "digest",
          message,
        },
      });
      notified++;
    }
  }

  return NextResponse.json({ notified, articlesProcessed: articles.length });
}

export const dynamic = "force-dynamic";
