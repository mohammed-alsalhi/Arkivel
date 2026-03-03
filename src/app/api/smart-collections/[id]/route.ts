import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function getCollection(id: string, userId: string) {
  return prisma.smartCollection.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(_req.url);
  const wantsArticles = url.searchParams.get("articles") === "1";
  const user = await getSession();

  const collection = await prisma.smartCollection.findFirst({
    where: { id, OR: [{ isPublic: true }, ...(user ? [{ userId: user.id }] : [])] },
  });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!wantsArticles) return NextResponse.json(collection);

  // Execute the stored query
  const q = collection.query as Record<string, unknown>;
  const articles = await prisma.article.findMany({
    where: {
      status: (q.status as string | undefined) || "published",
      ...(q.categoryId ? { categoryId: q.categoryId as string } : {}),
      ...(q.authorId ? { userId: q.authorId as string } : {}),
      ...(q.dateFrom || q.dateTo
        ? {
            createdAt: {
              ...(q.dateFrom ? { gte: new Date(q.dateFrom as string) } : {}),
              ...(q.dateTo ? { lte: new Date(q.dateTo as string) } : {}),
            },
          }
        : {}),
      ...(q.tags && Array.isArray(q.tags) && q.tags.length > 0
        ? { tags: { some: { tag: { slug: { in: q.tags as string[] } } } } }
        : {}),
    },
    select: { id: true, title: true, slug: true, excerpt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ collection, articles });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getCollection(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, query, isPublic } = await request.json();
  const updated = await prisma.smartCollection.update({
    where: { id },
    data: { ...(name && { name }), ...(query && { query }), ...(isPublic !== undefined && { isPublic }) },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getCollection(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.smartCollection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
