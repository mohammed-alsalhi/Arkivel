import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const status = searchParams.get("status");
  const slug = searchParams.get("slug");

  const where: Record<string, unknown> = {};
  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (status) where.status = status;
  if (slug) where.slug = slug;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({ articles, total, page, limit });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { title, content, contentRaw, excerpt, coverImage, categoryId, tagIds, isDisambiguation, redirectTo, infobox, status: articleStatus, isPinned } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  let slug = generateSlug(title);

  // Ensure unique slug
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      contentRaw,
      excerpt: excerpt || content.replace(/<[^>]*>/g, "").substring(0, 200),
      coverImage,
      isDisambiguation: isDisambiguation || false,
      redirectTo: redirectTo || null,
      infobox: infobox || null,
      categoryId: categoryId || null,
      status: articleStatus || "published",
      isPinned: isPinned || false,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(article, { status: 201 });
}

export const dynamic = "force-dynamic";
