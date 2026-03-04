import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          updatedAt: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(watchlist);
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { articleId } = await request.json();

  if (!articleId) {
    return NextResponse.json({ error: "articleId is required" }, { status: 400 });
  }

  // Check article exists
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Upsert to avoid duplicates
  const entry = await prisma.watchlist.upsert({
    where: {
      userId_articleId: { userId: user.id, articleId },
    },
    update: {},
    create: {
      userId: user.id,
      articleId,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { articleId } = await request.json();

  if (!articleId) {
    return NextResponse.json({ error: "articleId is required" }, { status: 400 });
  }

  await prisma.watchlist.deleteMany({
    where: { userId: user.id, articleId },
  });

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
