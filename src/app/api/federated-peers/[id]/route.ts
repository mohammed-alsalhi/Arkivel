import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { name, baseUrl, apiKey, enabled } = await request.json();
  const peer = await prisma.federatedPeer.update({
    where: { id },
    data: {
      name: name?.trim(),
      baseUrl: baseUrl?.trim().replace(/\/$/, ""),
      apiKey: apiKey?.trim() || null,
      enabled: Boolean(enabled),
    },
  });
  return NextResponse.json(peer);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.federatedPeer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
