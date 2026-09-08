import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/search-alerts
 * Run daily. Checks saved searches with alertEnabled=true against articles
 * published/updated since lastAlertAt. Creates in-app notifications for matches.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.savedSearch.findMany({
    where: { alertEnabled: true },
    include: { user: { select: { id: true } } },
  });

  let notified = 0;

  for (const alert of alerts) {
    const since = alert.lastAlertAt ?? alert.createdAt;

    // Simple text search for new matching articles published since last check
    const query = alert.query.trim();
    if (!query) continue;

    const words = query.split(/\s+/).filter((w) => w.length >= 2);
    const textWhere =
      words.length > 1
        ? {
            AND: words.map((word) => ({
              OR: [
                { title: { contains: word, mode: "insensitive" as const } },
                { content: { contains: word, mode: "insensitive" as const } },
              ],
            })),
          }
        : {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { content: { contains: query, mode: "insensitive" as const } },
            ],
          };

    const matches = await prisma.article.findMany({
      where: {
        AND: [
          textWhere,
          { status: "published" },
          { updatedAt: { gt: since } },
        ],
      },
      select: { id: true, title: true, slug: true },
      take: 5,
    });

    if (matches.length === 0) continue;

    // Create one notification per user (summarising all matches)
    const titles = matches.map((m) => m.title).join(", ");
    await prisma.notification.create({
      data: {
        userId: alert.user.id,
        type: "search_alert",
        message: `New matches for "${alert.name || alert.query}": ${matches.length} article${matches.length > 1 ? "s" : ""} — ${titles}`,
      },
    });

    // Update lastAlertAt
    await prisma.savedSearch.update({
      where: { id: alert.id },
      data: { lastAlertAt: new Date() },
    });

    notified++;
  }

  return NextResponse.json({ checked: alerts.length, notified });
}
