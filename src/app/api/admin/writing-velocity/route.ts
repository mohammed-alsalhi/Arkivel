import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/writing-velocity
 * Returns weekly word counts added over the past 12 weeks
 */
export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  const revisions = await prisma.articleRevision.findMany({
    where: { createdAt: { gte: twelveWeeksAgo } },
    select: { createdAt: true, content: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by week (ISO week number relative to now)
  const weekMap: Record<string, number> = {};

  for (const rev of revisions) {
    const weekStart = new Date(rev.createdAt);
    // Reset to start of week (Monday)
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString().slice(0, 10);

    const words = rev.content
      ? rev.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length
      : 0;

    weekMap[key] = (weekMap[key] ?? 0) + words;
  }

  // Build ordered array of last 12 weeks
  const weeks: { week: string; words: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    weeks.push({ week: key, words: weekMap[key] ?? 0 });
  }

  return NextResponse.json(weeks);
}
