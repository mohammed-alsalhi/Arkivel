import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { compareSnapshotContent } from "@/lib/editor-reliability";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET — list snapshots for an article, or compare one snapshot with current content
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const snapshotId = req.nextUrl.searchParams.get("snapshotId");
  const compare = req.nextUrl.searchParams.get("compare") === "1";

  if (snapshotId) {
    const snapshot = await prisma.articleSnapshot.findFirst({
      where: { id: snapshotId, articleId: id },
      select: { id: true, label: true, content: true, contentRaw: true, infobox: true, createdAt: true },
    });
    if (!snapshot) return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });

    if (compare) {
      const article = await prisma.article.findUnique({
        where: { id },
        select: { content: true },
      });
      return NextResponse.json({
        snapshot: { id: snapshot.id, label: snapshot.label, createdAt: snapshot.createdAt },
        comparison: compareSnapshotContent(article?.content ?? "", snapshot.content),
      });
    }

    return NextResponse.json(snapshot);
  }

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

// PUT — restore a snapshot into the article, preserving current state as a new snapshot first
export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await isAdmin();
  const session = await getSession();
  if (!admin && !session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { snapshotId } = await req.json();
  if (!snapshotId) return NextResponse.json({ error: "snapshotId required" }, { status: 400 });

  const [article, snapshot] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      select: { title: true, content: true, contentRaw: true, infobox: true },
    }),
    prisma.articleSnapshot.findFirst({
      where: { id: snapshotId, articleId: id },
      select: { id: true, label: true, content: true, contentRaw: true, infobox: true },
    }),
  ]);

  if (!article || !snapshot) return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });

  const restored = await prisma.$transaction(async (tx) => {
    await tx.articleSnapshot.create({
      data: {
        articleId: id,
        label: `Before restore: ${snapshot.label}`,
        content: article.content,
        contentRaw: article.contentRaw ?? null,
        infobox: article.infobox ?? undefined,
        userId: session?.id ?? null,
      },
    });
    return tx.article.update({
      where: { id },
      data: {
        content: snapshot.content,
        contentRaw: snapshot.contentRaw ?? null,
        infobox: snapshot.infobox ?? undefined,
      },
      select: { id: true, slug: true, title: true, updatedAt: true },
    });
  });

  return NextResponse.json({ restored, snapshotId: snapshot.id });
}

// DELETE — remove a snapshot
export async function DELETE(req: NextRequest, { params: _params }: Params) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { snapshotId } = await req.json();
  await prisma.articleSnapshot.delete({ where: { id: snapshotId } });
  return NextResponse.json({ ok: true });
}
