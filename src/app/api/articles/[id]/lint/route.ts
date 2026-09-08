import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { lintArticle } from "@/lib/linting";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      categoryId: true,
      tags: { select: { tagId: true } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Build slug set for broken-link detection
  const allArticles = await prisma.article.findMany({
    select: { slug: true },
  });
  const existingSlugs = new Set(allArticles.map((a) => a.slug));

  const results = lintArticle(article, existingSlugs);

  return NextResponse.json({
    articleId: article.id,
    articleTitle: article.title,
    articleSlug: article.slug,
    results,
  });
}

export const dynamic = "force-dynamic";
