/**
 * POST /api/cron/expire-articles
 * Finds published articles whose expiresAt has passed and auto-archives them (status → "draft").
 * Call this from a Vercel cron job or any external scheduler.
 * Requires CRON_SECRET header to match the CRON_SECRET env var.
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expired = await prisma.article.findMany({
    where: {
      expiresAt: { lte: now },
      status: { not: "draft" },
    },
    select: { id: true, title: true },
  });

  if (expired.length === 0) {
    return NextResponse.json({ archived: 0 });
  }

  await prisma.article.updateMany({
    where: { id: { in: expired.map((a) => a.id) } },
    data: { status: "draft" },
  });

  return NextResponse.json({ archived: expired.length, articles: expired.map((a) => a.title) });
}

export const dynamic = "force-dynamic";
