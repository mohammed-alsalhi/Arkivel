import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { getSession, isAdmin } from "@/lib/auth";

// Cursor format: base64("<score>|<updatedAt ISO>|<id>")
function encodeCursor(score: number, updatedAt: Date, id: string): string {
  return Buffer.from(`${score}|${updatedAt.toISOString()}|${id}`).toString("base64url");
}

function decodeCursor(
  cursor: string
): { score: number; updatedAt: Date; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
    const parts = decoded.split("|");
    if (parts.length < 3) return null;
    const [scoreStr, isoDate, id] = parts;
    const score = parseFloat(scoreStr);
    const updatedAt = new Date(isoDate);
    if (isNaN(score) || isNaN(updatedAt.getTime()) || !id) return null;
    return { score, updatedAt, id };
  } catch {
    return null;
  }
}

function relevanceScore(title: string, query: string): number {
  const t = title.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  return 10; // content-only match (article still matched via WHERE)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function highlightText(text: string, words: string[]): string {
  if (!text || words.length === 0) return text;
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  return text.replace(pattern, "<mark>$1</mark>");
}

export async function GET(request: NextRequest) {
  // Auth: accept API key OR session OR unauthenticated (public search)
  const apiKeyUser = await validateApiKey(request);
  const session = apiKeyUser ? null : await getSession();
  const admin = apiKeyUser ? false : await isAdmin();
  const isAdminAccess = admin || !!apiKeyUser;

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() || "";
  const cursorParam = searchParams.get("cursor");
  const limitParam = parseInt(searchParams.get("limit") || "20");
  const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 20 : limitParam));

  if (query.length < 2) {
    return NextResponse.json({
      data: [],
      meta: {
        hasMore: false,
        nextCursor: null,
        query,
        totalEstimate: 0,
      },
    });
  }

  const words = query.split(/\s+/).filter((w) => w.length >= 2);
  const effectiveWords = words.length > 0 ? words : [query];

  // Build text search where clause
  const textWhere =
    effectiveWords.length > 1
      ? {
          AND: effectiveWords.map((word) => ({
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

  // Visibility filter
  const statusWhere = isAdminAccess ? {} : { status: "published" };
  const where = { AND: [textWhere, statusWhere] };

  // Get total estimate (without cursor, for meta)
  const totalEstimate = await prisma.article.count({ where });

  // Decode cursor for pagination
  const cursorData = cursorParam ? decodeCursor(cursorParam) : null;

  // Fetch more than needed so we can re-rank and paginate
  // We fetch in batches larger than limit to perform in-memory relevance ranking
  const fetchMultiplier = 5;
  const fetchLimit = limit * fetchMultiplier;

  // Build cursor-based offset: use updatedAt + id for stable pagination after ranking
  // Since we rank in memory we need to fetch a large enough window
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursorFilter: any = undefined;
  if (cursorData) {
    cursorFilter = {
      OR: [
        { updatedAt: { lt: cursorData.updatedAt } },
        {
          updatedAt: cursorData.updatedAt,
          id: { gt: cursorData.id },
        },
      ],
    };
  }

  const finalWhere = cursorFilter
    ? { AND: [where, cursorFilter] }
    : where;

  const articles = await prisma.article.findMany({
    where: finalWhere,
    take: fetchLimit,
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      updatedAt: true,
      status: true,
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });

  // Score and sort by relevance
  const queryLower = query.toLowerCase();
  const scored = articles.map((a) => ({
    ...a,
    score: relevanceScore(a.title, queryLower),
  }));
  scored.sort((a, b) => b.score - a.score || b.updatedAt.getTime() - a.updatedAt.getTime());

  const hasMore = scored.length > limit;
  const pageResults = scored.slice(0, limit);

  let nextCursor: string | null = null;
  if (hasMore && pageResults.length > 0) {
    const last = pageResults[pageResults.length - 1];
    nextCursor = encodeCursor(last.score, last.updatedAt, last.id);
  }

  const data = pageResults.map((a) => {
    const rawText = a.excerpt || stripHtml(a.content).substring(0, 300);
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      highlightedExcerpt: highlightText(rawText, effectiveWords),
      score: a.score,
      updatedAt: a.updatedAt.toISOString(),
      category: a.category,
      tags: a.tags.map((t) => t.tag),
    };
  });

  return NextResponse.json({
    data,
    meta: {
      hasMore,
      nextCursor,
      query,
      totalEstimate,
    },
  });
}

export const dynamic = "force-dynamic";
