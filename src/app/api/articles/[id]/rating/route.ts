import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const logs = await prisma.metricLog.findMany({
    where: { type: "article_rating", path: `/articles/${id}` },
    select: { metadata: true },
  });

  const ratings = logs
    .map((l) => (l.metadata as { rating?: number })?.rating)
    .filter((r): r is number => typeof r === "number");

  const average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return NextResponse.json({
    average: Math.round(average * 10) / 10,
    count: ratings.length,
  });
}

export const dynamic = "force-dynamic";
