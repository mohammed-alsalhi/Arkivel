import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const KEY = "read_only_mode";

export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const record = await prisma.pluginState.findUnique({ where: { id: KEY } });
    return NextResponse.json({ enabled: record?.enabled ?? false });
  } catch {
    return NextResponse.json(
      { enabled: false, error: "Read-only mode status is unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { enabled } = await request.json();
    const record = await prisma.pluginState.upsert({
      where: { id: KEY },
      update: { enabled: !!enabled },
      create: { id: KEY, enabled: !!enabled },
    });
    return NextResponse.json({ enabled: record.enabled });
  } catch {
    return NextResponse.json(
      { error: "Read-only mode could not be updated" },
      { status: 503 },
    );
  }
}
