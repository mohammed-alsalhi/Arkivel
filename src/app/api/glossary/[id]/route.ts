import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.term !== undefined) data.term = body.term.trim();
  if (body.definition !== undefined) data.definition = body.definition.trim();
  if (body.aliases !== undefined)
    data.aliases = Array.isArray(body.aliases)
      ? body.aliases.map((a: string) => a.trim()).filter(Boolean)
      : [];

  const entry = await prisma.glossaryTerm.update({ where: { id }, data });
  return NextResponse.json(entry);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.glossaryTerm.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
