import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const items = await prisma.seeAlso.findMany({
    where: { articleId: id },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const { targetSlug, label } = await request.json();
  if (!targetSlug?.trim()) {
    return NextResponse.json({ error: "targetSlug is required" }, { status: 400 });
  }

  const count = await prisma.seeAlso.count({ where: { articleId: id } });
  const item = await prisma.seeAlso.create({
    data: {
      articleId: id,
      targetSlug: targetSlug.trim(),
      label: label?.trim() || null,
      position: count,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id: articleId } = await params;
  const { seeAlsoId } = await request.json();
  await prisma.seeAlso.delete({ where: { id: seeAlsoId, articleId } });
  return NextResponse.json({ success: true });
}
