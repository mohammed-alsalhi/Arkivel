import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const canvas = await prisma.canvas.findFirst({
    where: { id, userId: session.id },
  });
  if (!canvas) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(canvas);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, state } = await req.json();
  const canvas = await prisma.canvas.updateMany({
    where: { id, userId: session.id },
    data: { ...(name !== undefined ? { name } : {}), ...(state !== undefined ? { state } : {}) },
  });
  return NextResponse.json({ ok: true, count: canvas.count });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.canvas.deleteMany({ where: { id, userId: session.id } });
  return NextResponse.json({ ok: true });
}
