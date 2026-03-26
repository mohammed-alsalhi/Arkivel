import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [topQueries, zeroResultQueries, dailyVolume, totalCount] = await Promise.all([
    // Top queries by count
    prisma.searchQueryLog.groupBy({
      by: ["query"],
      where: { createdAt: { gte: since } },
      _count: { query: true },
      _avg: { resultCount: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    }),

    // Zero-result queries
    prisma.searchQueryLog.groupBy({
      by: ["query"],
      where: { createdAt: { gte: since }, resultCount: 0 },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    }),

    // Daily search volume (last N days)
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS date, COUNT(*) AS count
      FROM "SearchQueryLog"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `,

    // Total queries in period
    prisma.searchQueryLog.count({ where: { createdAt: { gte: since } } }),
  ]);

  return NextResponse.json({
    topQueries: topQueries.map((q) => ({
      query: q.query,
      count: q._count.query,
      avgResults: Math.round((q._avg.resultCount ?? 0) * 10) / 10,
    })),
    zeroResultQueries: zeroResultQueries.map((q) => ({
      query: q.query,
      count: q._count.query,
    })),
    dailyVolume: dailyVolume.map((d) => ({
      date: new Date(d.date).toISOString().slice(0, 10),
      count: Number(d.count),
    })),
    totalCount,
    days,
  });
}
