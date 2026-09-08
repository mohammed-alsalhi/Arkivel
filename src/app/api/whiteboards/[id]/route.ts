import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const board = await prisma.whiteboard.findUnique({ where: { id } });
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(board);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { id } = await params;
  const { title, data } = await request.json();

  const board = await prisma.whiteboard.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(data !== undefined ? { data } : {}),
    },
  });
  return NextResponse.json(board);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { id } = await params;
  await prisma.whiteboard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
