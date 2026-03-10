import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET — list snapshots for an article
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const snapshots = await prisma.articleSnapshot.findMany({
    where: { articleId: id },
    select: {
      id: true,
      label: true,
      createdAt: true,
      user: { select: { username: true, displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(snapshots);
}

// POST — create a named snapshot
export async function POST(req: NextRequest, { params }: Params) {
  const admin = await isAdmin();
  const session = await getSession();
  if (!admin && !session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { label } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: "label required" }, { status: 400 });

  const article = await prisma.article.findUnique({
    where: { id },
    select: { content: true, contentRaw: true, infobox: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const snapshot = await prisma.articleSnapshot.create({
    data: {
      articleId: id,
      label: label.trim(),
      content: article.content,
      contentRaw: article.contentRaw ?? null,
      infobox: article.infobox ?? undefined,
      userId: session?.id ?? null,
    },
    select: { id: true, label: true, createdAt: true },
  });
  return NextResponse.json(snapshot, { status: 201 });
}

// DELETE — remove a snapshot
export async function DELETE(req: NextRequest, { params: _params }: Params) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { snapshotId } = await req.json();
  await prisma.articleSnapshot.delete({ where: { id: snapshotId } });
  return NextResponse.json({ ok: true });
}
