import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/referrers?days=30
 * Returns top referrer domains across all articles for the past N days.
 */
export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "30")));

  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

  const rows = await prisma.articleReferrer.groupBy({
    by: ["referrer"],
    where: { date: { gte: since } },
    _sum: { count: true },
    orderBy: { _sum: { count: "desc" } },
    take: 30,
  });

  const total = rows.reduce((s, r) => s + (r._sum.count ?? 0), 0);

  const result = rows.map((r) => ({
    referrer: r.referrer || "(direct / none)",
    count: r._sum.count ?? 0,
    pct: total > 0 ? Math.round(((r._sum.count ?? 0) / total) * 100) : 0,
  }));

  return NextResponse.json({ total, referrers: result, days });
}
