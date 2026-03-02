import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await validateApiKey(request);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Include X-API-Key header." },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const status = searchParams.get("status") || undefined;

  const where: Record<string, unknown> = { published: true };
  if (category) {
    where.category = { slug: category };
  }
  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }
  if (status) {
    where.status = status;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        contentRaw: true,
        published: true,
        status: true,
        coverImage: true,
        infobox: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.article.count({ where }),
  ]);

  const formatted = articles.map((a) => ({
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    contentRaw: a.contentRaw,
    published: a.published,
    status: a.status,
    coverImage: a.coverImage,
    infobox: a.infobox,
    category: a.category ? { name: a.category.name, slug: a.category.slug } : null,
    tags: a.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return NextResponse.json({
    articles: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
