import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const categoryId = request.nextUrl.searchParams.get("category") || null;
  const tagSlugs = request.nextUrl.searchParams.get("tags") || null; // comma-separated tag slugs
  const dateFrom = request.nextUrl.searchParams.get("dateFrom") || null;
  const dateTo = request.nextUrl.searchParams.get("dateTo") || null;

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const select = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    content: true,
    updatedAt: true,
    category: { select: { id: true, name: true, icon: true, slug: true } },
    tags: { include: { tag: true } },
  };

  // Split into words for multi-word search (each word must appear somewhere)
  const words = query.split(/\s+/).filter((w) => w.length >= 2);

  // Build text search conditions
  const textWhere =
    words.length > 1
      ? {
          AND: words.map((word) => ({
            OR: [
              { title: { contains: word, mode: "insensitive" as const } },
              { content: { contains: word, mode: "insensitive" as const } },
              { excerpt: { contains: word, mode: "insensitive" as const } },
            ],
          })),
        }
      : {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { content: { contains: query, mode: "insensitive" as const } },
            { excerpt: { contains: query, mode: "insensitive" as const } },
          ],
        };

  // Build filter conditions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any[] = [];

  if (categoryId) {
    filters.push({ categoryId });
  }

  if (tagSlugs) {
    const slugList = tagSlugs.split(",").map((s) => s.trim()).filter(Boolean);
    if (slugList.length > 0) {
      filters.push({
        tags: {
          some: {
            tag: { slug: { in: slugList } },
          },
        },
      });
    }
  }

  if (dateFrom) {
    filters.push({ updatedAt: { gte: new Date(dateFrom) } });
  }

  if (dateTo) {
    // Include the full end date day
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    filters.push({ updatedAt: { lt: endDate } });
  }

  // Combine text search with filters
  const where =
    filters.length > 0
      ? { AND: [textWhere, ...filters] }
      : textWhere;

  // Fetch more than needed so we can re-sort by relevance
  const articles = await prisma.article.findMany({
    where,
    take: limit * 3,
    select,
  });

  // Rank by relevance: exact title > title starts with > title contains > content only
  const queryLower = query.toLowerCase();
  articles.sort((a, b) => {
    return relevanceScore(b.title, queryLower) - relevanceScore(a.title, queryLower);
  });

  // Add highlighted excerpts
  const results = articles.slice(0, limit).map((article) => {
    const highlightedExcerpt = highlightText(
      article.excerpt || stripHtml(article.content).substring(0, 300),
      words.length > 0 ? words : [query]
    );

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      highlightedExcerpt,
      updatedAt: article.updatedAt,
      category: article.category,
      tags: article.tags,
    };
  });

  return NextResponse.json(results);
}

function relevanceScore(title: string, query: string): number {
  const t = title.toLowerCase();
  if (t === query) return 100;           // exact match
  if (t.startsWith(query)) return 80;    // title starts with query
  if (t.includes(query)) return 60;      // title contains query
  return 0;                              // content-only match
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function highlightText(text: string, words: string[]): string {
  if (!text || words.length === 0) return text;

  // Escape special regex characters in search words
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  return text.replace(pattern, "<mark>$1</mark>");
}
