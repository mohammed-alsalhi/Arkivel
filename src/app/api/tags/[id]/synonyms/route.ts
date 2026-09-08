import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET — list synonyms for a tag
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const synonyms = await prisma.tagSynonym.findMany({
    where: { tagId: id },
    select: { id: true, alias: true, createdAt: true },
    orderBy: { alias: "asc" },
  });
  return NextResponse.json(synonyms);
}

// POST — add a synonym
export async function POST(req: NextRequest, { params }: Params) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { alias } = await req.json();
  if (!alias?.trim()) return NextResponse.json({ error: "alias required" }, { status: 400 });

  const synonym = await prisma.tagSynonym.create({
    data: { tagId: id, alias: alias.trim() },
  });
  return NextResponse.json(synonym, { status: 201 });
}

// DELETE — remove a synonym by id (pass id in body)
export async function DELETE(req: NextRequest, { params: _params }: Params) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { synonymId } = await req.json();
  await prisma.tagSynonym.delete({ where: { id: synonymId } });
  return NextResponse.json({ ok: true });
}
