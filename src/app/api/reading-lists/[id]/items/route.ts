import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const items = await prisma.readingListItem.findMany({
    where: { listId: id },
    include: { article: { select: { id: true, title: true, slug: true, excerpt: true } } },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.readingList.findFirst({ where: { id, userId: user.id } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { articleId } = await request.json();
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const count = await prisma.readingListItem.count({ where: { listId: id } });
  const item = await prisma.readingListItem.create({
    data: { listId: id, articleId, order: count },
    include: { article: { select: { title: true, slug: true } } },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.readingList.findFirst({ where: { id, userId: user.id } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const articleId = url.searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  await prisma.readingListItem.deleteMany({ where: { listId: id, articleId } });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
