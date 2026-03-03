import prisma from "@/lib/prisma";
import pg from "pg";

export type SearchOptions = {
  limit?: number;
  categoryId?: string;
  tagSlugs?: string[];
  dateFrom?: string;
  dateTo?: string;
  author?: string;
  status?: string;
};

export type TsvectorResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  rank: number;
  headline: string;
};

/**
 * Attempts PostgreSQL full-text tsvector search via raw SQL.
 * Falls back to Prisma LIKE-based search if raw SQL is unavailable.
 */
export async function tsvectorSearch(
  query: string,
  options: SearchOptions = {}
): Promise<TsvectorResult[]> {
  const { limit = 20 } = options;

  try {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

    try {
      // Build WHERE clauses
      const conditions: string[] = [
        `"searchVector" @@ websearch_to_tsquery('english', $1)`,
      ];
      const params: (string | number)[] = [query];
      let paramIndex = 2;

      // Default to published status unless overridden
      const statusFilter = options.status || "published";
      conditions.push(`status = $${paramIndex}`);
      params.push(statusFilter);
      paramIndex++;

      if (options.categoryId) {
        conditions.push(`"categoryId" = $${paramIndex}`);
        params.push(options.categoryId);
        paramIndex++;
      }

      if (options.author) {
        conditions.push(`"userId" = $${paramIndex}`);
        params.push(options.author);
        paramIndex++;
      }

      if (options.dateFrom) {
        conditions.push(`"updatedAt" >= $${paramIndex}::timestamp`);
        params.push(options.dateFrom);
        paramIndex++;
      }

      if (options.dateTo) {
        const endDate = new Date(options.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        conditions.push(`"updatedAt" < $${paramIndex}::timestamp`);
        params.push(endDate.toISOString());
        paramIndex++;
      }

      conditions.push(`CAST($${paramIndex} AS int) > 0`);
      params.push(limit);

      const whereClause = conditions.join(" AND ");

      const sql = `
        SELECT id, title, slug, excerpt,
               ts_rank_cd("searchVector", websearch_to_tsquery('english', $1)) AS rank,
               ts_headline('english', content, websearch_to_tsquery('english', $1), 'MaxWords=30') AS headline
        FROM "Article"
        WHERE ${whereClause}
        ORDER BY rank DESC
        LIMIT $${paramIndex}
      `;

      const result = await pool.query(sql, params);

      // Apply tag filtering in application layer if needed
      let rows = result.rows as TsvectorResult[];

      if (options.tagSlugs && options.tagSlugs.length > 0) {
        const articleIds = rows.map((r) => r.id);
        if (articleIds.length > 0) {
          const tagged = await prisma.articleTag.findMany({
            where: {
              articleId: { in: articleIds },
              tag: { slug: { in: options.tagSlugs } },
            },
            select: { articleId: true },
          });
          const taggedIds = new Set(tagged.map((t) => t.articleId));
          rows = rows.filter((r) => taggedIds.has(r.id));
        }
      }

      return rows;
    } finally {
      await pool.end();
    }
  } catch {
    // tsvector search failed (no searchVector column, pool error, etc.)
    // Fall back to Prisma LIKE-based search
    return fallbackLikeSearch(query, options);
  }
}

/**
 * Fallback LIKE-based search using Prisma when tsvector is unavailable.
 */
async function fallbackLikeSearch(
  query: string,
  options: SearchOptions
): Promise<TsvectorResult[]> {
  const { limit = 20 } = options;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any[] = [];

  // Default to published status unless overridden
  filters.push({ status: options.status || "published" });

  if (options.categoryId) {
    filters.push({ categoryId: options.categoryId });
  }

  if (options.tagSlugs && options.tagSlugs.length > 0) {
    filters.push({
      tags: {
        some: {
          tag: { slug: { in: options.tagSlugs } },
        },
      },
    });
  }

  if (options.dateFrom) {
    filters.push({ updatedAt: { gte: new Date(options.dateFrom) } });
  }

  if (options.dateTo) {
    const endDate = new Date(options.dateTo);
    endDate.setDate(endDate.getDate() + 1);
    filters.push({ updatedAt: { lt: endDate } });
  }

  if (options.author) {
    filters.push({ userId: options.author });
  }

  const where = { AND: [textWhere, ...filters] };

  const articles = await prisma.article.findMany({
    where,
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Score results by relevance
  const queryLower = query.toLowerCase();
  return articles
    .map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      rank: scoreRelevance(a.title, queryLower),
      headline: stripHtml(a.content).substring(0, 150),
    }))
    .sort((a, b) => b.rank - a.rank);
}

function scoreRelevance(title: string, query: string): number {
  const t = title.toLowerCase();
  if (t === query) return 100;
  if (t.startsWith(query)) return 80;
  if (t.includes(query)) return 60;
  return 10;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
