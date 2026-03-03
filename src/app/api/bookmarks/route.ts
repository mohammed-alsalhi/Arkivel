import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: { article: { select: { id: true, title: true, slug: true, excerpt: true, updatedAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId, note } = await request.json();
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_articleId: { userId: user.id, articleId } },
    create: { userId: user.id, articleId, note },
    update: { note },
    include: { article: { select: { title: true, slug: true } } },
  });

  return NextResponse.json(bookmark, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const articleId = url.searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  await prisma.bookmark.deleteMany({ where: { userId: user.id, articleId } });
  return NextResponse.json({ ok: true });
}
