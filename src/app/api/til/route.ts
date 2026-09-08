import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tag = url.searchParams.get("tag");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 20;

  const where = tag ? { tags: { has: tag } } : {};

  const [posts, total] = await Promise.all([
    prisma.tILPost.findMany({
      where: { ...where, archivedAt: null },
      include: {
        user: { select: { username: true, displayName: true } },
        article: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tILPost.count({ where: { ...where, archivedAt: null } }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, articleId, tags } = await request.json();
  if (!content || typeof content !== "string") return NextResponse.json({ error: "content required" }, { status: 400 });
  if (content.length > 280) return NextResponse.json({ error: "Max 280 characters" }, { status: 400 });

  const post = await prisma.tILPost.create({
    data: {
      userId: user.id,
      content,
      articleId: articleId || null,
      tags: Array.isArray(tags) ? tags : [],
    },
    include: {
      user: { select: { username: true, displayName: true } },
      article: { select: { title: true, slug: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}

export const dynamic = "force-dynamic";
