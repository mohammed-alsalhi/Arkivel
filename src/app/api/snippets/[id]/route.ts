import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, content } = await request.json();

  const snippet = await prisma.snippet.findUnique({ where: { id } });
  if (!snippet || snippet.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.snippet.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(content !== undefined && { content: content.trim() }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const snippet = await prisma.snippet.findUnique({ where: { id } });
  if (!snippet || snippet.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.snippet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
