import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const since = new Date();
  since.setDate(since.getDate() - 29); // last 30 days inclusive

  const rows = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
    SELECT DATE_TRUNC('day', "createdAt") AS date, COUNT(*) AS count
    FROM "MetricLog"
    WHERE type = 'page_view'
      AND path = ${`/articles/${id}`}
      AND "createdAt" >= ${since}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  `;

  // Build full 30-day series (fill missing days with 0)
  const byDate = new Map<string, number>();
  for (const r of rows) {
    byDate.set(new Date(r.date).toISOString().slice(0, 10), Number(r.count));
  }

  const series: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, count: byDate.get(key) ?? 0 });
  }

  return NextResponse.json(series);
}
