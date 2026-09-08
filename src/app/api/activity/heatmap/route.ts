import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // Last 52 weeks = 364 days
  const since = new Date();
  since.setDate(since.getDate() - 364);

  const revisions = await prisma.articleRevision.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Count edits per day (YYYY-MM-DD)
  const counts: Record<string, number> = {};
  for (const r of revisions) {
    const key = r.createdAt.toISOString().slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return NextResponse.json({ counts });
}
