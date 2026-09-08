import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/external-links — top outbound links by click count */
export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const logs = await prisma.metricLog.groupBy({
    by: ["path"],
    where: { type: "external_link_click" },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: 100,
  });

  const result = logs.map((l) => ({ url: l.path, clicks: l._count.path }));
  return NextResponse.json(result);
}
