import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: { select: { tagId: true } } },
  });

  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tagIds = article.tags.map((t) => t.tagId);

  const related = await prisma.article.findMany({
    where: {
      id: { not: id },
      published: true,
      status: "published",
      OR: [
        ...(article.categoryId ? [{ categoryId: article.categoryId }] : []),
        ...(tagIds.length > 0 ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: { select: { name: true, slug: true } },
    },
    take: 10,
  });

  return NextResponse.json(related);
}

export const dynamic = "force-dynamic";
