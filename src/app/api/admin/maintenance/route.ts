import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const KEY = "maintenance_mode";

/** GET /api/admin/maintenance — get current mode */
export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const record = await prisma.pluginState.findUnique({ where: { id: KEY } });
  return NextResponse.json({ enabled: record?.enabled ?? false });
}

/** POST /api/admin/maintenance — toggle maintenance mode */
export async function POST(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { enabled } = await request.json();
  const record = await prisma.pluginState.upsert({
    where: { id: KEY },
    update: { enabled: !!enabled },
    create: { id: KEY, enabled: !!enabled },
  });
  return NextResponse.json({ enabled: record.enabled });
}
