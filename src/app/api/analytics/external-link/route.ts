import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** POST /api/analytics/external-link
 *  Body: { articleId: string; url: string }
 *  Logs an outbound link click as a MetricLog entry.
 */
export async function POST(request: NextRequest) {
  try {
    const { articleId, url } = await request.json();
    if (!url) return NextResponse.json({ ok: false });

    // Normalise: store just the hostname + path to avoid storing full query strings
    let normalised = url;
    try {
      const parsed = new URL(url);
      normalised = parsed.hostname + parsed.pathname;
    } catch {
      // keep raw url
    }

    await prisma.metricLog.create({
      data: {
        type: "external_link_click",
        path: normalised,
        duration: 0,
        metadata: articleId ? { articleId } : undefined,
      },
    });
  } catch {
    // fire-and-forget — never fail the page
  }

  return NextResponse.json({ ok: true });
}
