import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** POST — mark an article as read. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId } = await request.json();
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  await prisma.articleRead.upsert({
    where: { userId_articleId: { userId: session.id, articleId } },
    create: { userId: session.id, articleId },
    update: { readAt: new Date() },
  });

  return NextResponse.json({ success: true });
}

/** GET — reading stats per category for current user. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reads = await prisma.articleRead.findMany({
    where: { userId: session.id },
    include: { article: { select: { categoryId: true } } },
  });

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, _count: { select: { articles: true } } },
  });

  const readsByCategory = new Map<string, number>();
  for (const r of reads) {
    if (r.article.categoryId) {
      readsByCategory.set(r.article.categoryId, (readsByCategory.get(r.article.categoryId) || 0) + 1);
    }
  }

  const stats = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    total: c._count.articles,
    read: readsByCategory.get(c.id) || 0,
    percent: c._count.articles > 0 ? Math.round(((readsByCategory.get(c.id) || 0) / c._count.articles) * 100) : 0,
  }));

  return NextResponse.json({ totalRead: reads.length, stats });
}

export const dynamic = "force-dynamic";
