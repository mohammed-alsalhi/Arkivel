/**
 * POST /api/cron/review-reminders
 * Finds articles whose reviewDueAt has passed and status is not "published",
 * then notifies the article author and all watchers.
 * Call this from a Vercel cron job or any external scheduler.
 * Requires x-cron-secret header to match the CRON_SECRET env var.
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find articles overdue for review (reviewDueAt passed, not yet published)
  const overdueArticles = await prisma.article.findMany({
    where: {
      reviewDueAt: { not: null, lte: now },
      status: { not: "published" },
    },
    select: {
      id: true,
      title: true,
      userId: true,
      watchedBy: { select: { userId: true } },
    },
  });

  if (overdueArticles.length === 0) {
    return NextResponse.json({ notified: 0, articles: [] });
  }

  let notified = 0;
  const processedTitles: string[] = [];

  for (const article of overdueArticles) {
    const message = `Article "${article.title}" is overdue for review`;

    // Collect all user IDs to notify: author + watchers (deduplicated)
    const userIdsToNotify = new Set<string>();
    if (article.userId) {
      userIdsToNotify.add(article.userId);
    }
    for (const { userId } of article.watchedBy) {
      userIdsToNotify.add(userId);
    }

    if (userIdsToNotify.size === 0) continue;

    let articleNotified = false;

    for (const userId of userIdsToNotify) {
      // Check if a review-due notification was already sent in the last 24 hours
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          articleId: article.id,
          type: "review-due",
          createdAt: { gte: twentyFourHoursAgo },
        },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId,
          articleId: article.id,
          type: "review-due",
          message,
        },
      });
      notified++;
      articleNotified = true;
    }

    if (articleNotified) {
      processedTitles.push(article.title);
    }
  }

  return NextResponse.json({ notified, articles: processedTitles });
}
