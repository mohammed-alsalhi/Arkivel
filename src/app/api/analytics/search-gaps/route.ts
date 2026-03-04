import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // MetricLog entries where type = "search_no_results" and path = search query
  const logs = await prisma.metricLog.findMany({
    where: { type: "search_no_results" },
    select: { path: true },
  });

  // Aggregate counts
  const counts: Record<string, number> = {};
  for (const log of logs) {
    if (log.path) counts[log.path] = (counts[log.path] ?? 0) + 1;
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([query, count]) => ({ query, count }));

  return NextResponse.json(sorted);
}

export const dynamic = "force-dynamic";
