import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/analytics/referrer
 * Body: { articleId: string; referrer: string }
 * Called client-side when an article is viewed; increments the referrer count for today.
 * No auth required — lightweight analytics.
 */
export async function POST(request: NextRequest) {
  try {
    const { articleId, referrer } = await request.json();
    if (!articleId) return NextResponse.json({ ok: false }, { status: 400 });

    const date = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Normalize referrer: extract hostname or use "" for direct/same-site
    let normalized = "";
    if (referrer && typeof referrer === "string") {
      try {
        const url = new URL(referrer);
        normalized = url.hostname;
      } catch {
        normalized = referrer.slice(0, 100);
      }
    }

    await prisma.articleReferrer.upsert({
      where: { articleId_referrer_date: { articleId, referrer: normalized, date } },
      update: { count: { increment: 1 } },
      create: { articleId, referrer: normalized, date, count: 1 },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
