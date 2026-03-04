import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tsvectorSearch, SearchOptions } from "@/lib/search";
import { findFuzzyMatches } from "@/lib/fuzzy";
import { semanticSearch } from "@/lib/embeddings";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const includeSemantic = request.nextUrl.searchParams.get("semantic") === "1";
  const categoryId = request.nextUrl.searchParams.get("category") || null;
  const tagSlugs = request.nextUrl.searchParams.get("tags") || null; // comma-separated tag slugs
  const dateFrom = request.nextUrl.searchParams.get("dateFrom") || null;
  const dateTo = request.nextUrl.searchParams.get("dateTo") || null;
  const author = request.nextUrl.searchParams.get("author") || null;
  const status = request.nextUrl.searchParams.get("status") || null;

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], suggestions: [] });
  }

  // Build search options for tsvector
  const searchOptions: SearchOptions = {
    limit,
    categoryId: categoryId || undefined,
    tagSlugs: tagSlugs ? tagSlugs.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    author: author || undefined,
    status: status || undefined,
  };

  // Try tsvector search first
  let usedTsvector = false;
  let results: SearchResult[] = [];

  try {
    const tsvResults = await tsvectorSearch(query, searchOptions);

    if (tsvResults.length > 0) {
      usedTsvector = true;
      // Enrich tsvector results with category/tag info
      const articleIds = tsvResults.map((r) => r.id);
      const enriched = await prisma.article.findMany({
        where: { id: { in: articleIds } },
        select: {
          id: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: true } },
        },
      });

      const enrichedMap = new Map(enriched.map((a) => [a.id, a]));

      results = tsvResults.map((r) => {
        const extra = enrichedMap.get(r.id);
        return {
          id: r.id,
          title: r.title,
          slug: r.slug,
          excerpt: r.excerpt,
          highlightedExcerpt: r.headline,
          updatedAt: extra?.updatedAt ?? null,
          category: extra?.category ?? null,
          tags: extra?.tags ?? [],
        };
      });
    }
  } catch {
    // tsvector search threw — fall through to LIKE-based search
  }

  // Fall back to LIKE-based search if tsvector returned no results
  if (!usedTsvector || results.length === 0) {
    results = await likeBasedSearch(query, limit, categoryId, tagSlugs, dateFrom, dateTo, author, status);
  }

  // Fuzzy fallback: when we have few results, suggest similar titles
  let suggestions: string[] | undefined;

  if (results.length < 3) {
    try {
      const allTitles = await prisma.article.findMany({
        where: { status: status || "published" },
        select: { title: true },
      });

      const titleList = allTitles.map((a) => a.title);
      const fuzzyMatches = findFuzzyMatches(query, titleList, 0.2);

      // Exclude titles already in results
      const resultTitles = new Set(results.map((r) => r.title));
      suggestions = fuzzyMatches
        .filter((m) => !resultTitles.has(m.title))
        .slice(0, 5)
        .map((m) => m.title);

      if (suggestions.length === 0) {
        suggestions = undefined;
      }
    } catch {
      // Fuzzy matching failed — not critical, skip suggestions
    }
  }

  // Blend semantic results if requested and OPENAI_API_KEY is set
  let semanticResults: typeof results = [];
  if (includeSemantic && process.env.OPENAI_API_KEY) {
    try {
      const semHits = await semanticSearch(query, 5);
      const existingSlugs = new Set(results.map((r) => r.slug));
      const extra = semHits.filter((h) => !existingSlugs.has(h.slug));

      if (extra.length > 0) {
        const extraArticles = await prisma.article.findMany({
          where: { id: { in: extra.map((e) => e.id) }, status: "published" },
          select: {
            id: true, title: true, slug: true, excerpt: true, updatedAt: true,
            category: { select: { id: true, name: true, slug: true } },
            tags: { include: { tag: true } },
          },
        });
        semanticResults = extraArticles.map((a) => ({
          id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt,
          highlightedExcerpt: a.excerpt || "",
          updatedAt: a.updatedAt, category: a.category, tags: a.tags,
        }));
      }
    } catch {
      // Semantic search failed — skip silently
    }
  }

  // Log zero-result queries for the search gap dashboard
  if (results.length === 0 && semanticResults.length === 0) {
    prisma.metricLog.create({ data: { type: "search_no_results", path: query, duration: 0 } }).catch(() => {});
  }

  return NextResponse.json({ results, semanticResults, suggestions });
}

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  highlightedExcerpt: string;
  updatedAt: Date | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tags: any[];
};

async function likeBasedSearch(
  query: string,
  limit: number,
  categoryId: string | null,
  tagSlugs: string | null,
  dateFrom: string | null,
  dateTo: string | null,
  author: string | null,
  status: string | null
): Promise<SearchResult[]> {
  const select = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    content: true,
    updatedAt: true,
    category: { select: { id: true, name: true, slug: true } },
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

  // Default to published unless explicitly overridden
  filters.push({ status: status || "published" });

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

  if (author) {
    filters.push({ userId: author });
  }

  // Combine text search with filters
  const where = { AND: [textWhere, ...filters] };

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
  return articles.slice(0, limit).map((article) => {
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

export const dynamic = "force-dynamic";
