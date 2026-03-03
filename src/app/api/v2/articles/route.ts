import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { getSession, isAdmin } from "@/lib/auth";

// Cursor format: base64("<createdAt ISO>|<id>")
function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
    const [isoDate, id] = decoded.split("|");
    if (!isoDate || !id) return null;
    const createdAt = new Date(isoDate);
    if (isNaN(createdAt.getTime())) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

// Parse ?fields=id,title,slug into a Prisma select object
const ALLOWED_FIELDS = new Set([
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "contentRaw",
  "status",
  "published",
  "coverImage",
  "infobox",
  "isPinned",
  "sortOrder",
  "createdAt",
  "updatedAt",
]);

function buildSelect(
  fieldsParam: string | null,
  includeAdmin: boolean
): Record<string, unknown> {
  const defaultFields = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    status: true,
    published: true,
    createdAt: true,
    updatedAt: true,
    category: { select: { id: true, name: true, slug: true, icon: true } },
    tags: { select: { tag: { select: { id: true, name: true, slug: true, color: true } } } },
  };

  if (!fieldsParam) return defaultFields;

  const requested = fieldsParam.split(",").map((f) => f.trim()).filter(Boolean);
  const select: Record<string, unknown> = {};

  // Always include id and slug for cursor/identity
  select.id = true;
  select.slug = true;

  for (const field of requested) {
    if (ALLOWED_FIELDS.has(field)) {
      // Exclude sensitive content fields from non-admins if needed
      if ((field === "content" || field === "contentRaw") && !includeAdmin) {
        // still allowed — content is public for published articles
      }
      select[field] = true;
    }
  }

  // Always attach relations if requested
  if (requested.includes("category")) {
    select.category = { select: { id: true, name: true, slug: true, icon: true } };
  }
  if (requested.includes("tags")) {
    select.tags = { select: { tag: { select: { id: true, name: true, slug: true, color: true } } } };
  }

  return select;
}

export async function GET(request: NextRequest) {
  // Auth: accept API key OR session
  const apiKeyUser = await validateApiKey(request);
  const session = apiKeyUser ? null : await getSession();
  const admin = apiKeyUser ? false : await isAdmin();

  if (!apiKeyUser && !session && !admin) {
    // Public unauthenticated access is allowed but restricted to published only
  }

  const { searchParams } = request.nextUrl;
  const cursorParam = searchParams.get("cursor");
  const limitParam = parseInt(searchParams.get("limit") || "20");
  const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 20 : limitParam));
  const fieldsParam = searchParams.get("fields");
  const categorySlug = searchParams.get("category");
  const tagSlug = searchParams.get("tag");
  const statusFilter = searchParams.get("status");
  const searchQuery = searchParams.get("search");

  const isAdminAccess = admin || !!apiKeyUser;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  // Non-admins can only see published articles
  if (!isAdminAccess) {
    where.status = "published";
  } else if (statusFilter) {
    where.status = statusFilter;
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  if (searchQuery && searchQuery.trim().length >= 2) {
    const words = searchQuery.trim().split(/\s+/).filter((w) => w.length >= 2);
    const textWhere =
      words.length > 1
        ? {
            AND: words.map((word) => ({
              OR: [
                { title: { contains: word, mode: "insensitive" as const } },
                { excerpt: { contains: word, mode: "insensitive" as const } },
                { content: { contains: word, mode: "insensitive" as const } },
              ],
            })),
          }
        : {
            OR: [
              { title: { contains: searchQuery, mode: "insensitive" as const } },
              { excerpt: { contains: searchQuery, mode: "insensitive" as const } },
              { content: { contains: searchQuery, mode: "insensitive" as const } },
            ],
          };
    Object.assign(where, textWhere);
  }

  // Cursor pagination
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursorWhere: any = undefined;
  if (cursorParam) {
    const decoded = decodeCursor(cursorParam);
    if (decoded) {
      // Fetch rows where (createdAt < cursor.createdAt) OR (createdAt == cursor.createdAt AND id > cursor.id)
      cursorWhere = {
        OR: [
          { createdAt: { lt: decoded.createdAt } },
          { createdAt: decoded.createdAt, id: { gt: decoded.id } },
        ],
      };
    }
  }

  const finalWhere = cursorWhere ? { AND: [where, cursorWhere] } : where;

  const select = buildSelect(fieldsParam, isAdminAccess);

  // Fetch limit+1 to detect hasMore
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: finalWhere,
      take: limit + 1,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      select: {
        ...select,
        // Always fetch these for cursor generation
        id: true,
        createdAt: true,
      },
    }),
    prisma.article.count({ where }),
  ]);

  const hasMore = articles.length > limit;
  const pageArticles = hasMore ? articles.slice(0, limit) : articles;

  let nextCursor: string | null = null;
  if (hasMore && pageArticles.length > 0) {
    const last = pageArticles[pageArticles.length - 1];
    nextCursor = encodeCursor(last.createdAt as Date, last.id as string);
  }

  // Format tags from nested ArticleTag join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = pageArticles.map((a: any) => {
    const formatted: Record<string, unknown> = { ...a };
    if (Array.isArray(a.tags)) {
      formatted.tags = a.tags.map((t: { tag: unknown }) => t.tag);
    }
    return formatted;
  });

  return NextResponse.json({
    data,
    meta: {
      hasMore,
      nextCursor,
      total,
    },
  });
}
