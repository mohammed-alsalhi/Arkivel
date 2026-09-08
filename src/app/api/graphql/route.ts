import { createYoga, createSchema } from "graphql-yoga";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

// ─── Schema ───────────────────────────────────────────────────────────────────

const typeDefs = /* GraphQL */ `
  type Article {
    id: ID!
    title: String!
    slug: String!
    excerpt: String
    content: String
    status: String!
    isPinned: Boolean!
    createdAt: String!
    updatedAt: String!
    category: Category
    tags: [Tag!]!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    articles(limit: Int, offset: Int): [Article!]!
  }

  type Tag {
    id: ID!
    name: String!
    slug: String!
    color: String
  }

  type Revision {
    id: ID!
    articleId: ID!
    editSummary: String
    createdAt: String!
    author: String
  }

  type SearchResult {
    id: ID!
    title: String!
    slug: String!
    excerpt: String
  }

  type WikiStats {
    articles: Int!
    categories: Int!
    tags: Int!
    users: Int!
    revisions: Int!
  }

  type Query {
    article(slug: String!): Article
    articles(limit: Int, offset: Int, categorySlug: String, status: String): [Article!]!
    category(slug: String!): Category
    categories: [Category!]!
    tag(slug: String!): Tag
    tags: [Tag!]!
    search(q: String!, limit: Int): [SearchResult!]!
    revisions(articleSlug: String, limit: Int): [Revision!]!
    stats: WikiStats!
  }
`;

// ─── Resolvers ────────────────────────────────────────────────────────────────

const resolvers = {
  Query: {
    article: async (_: unknown, { slug }: { slug: string }) => {
      return prisma.article.findUnique({
        where: { slug },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });
    },

    articles: async (
      _: unknown,
      { limit = 20, offset = 0, categorySlug, status }: { limit?: number; offset?: number; categorySlug?: string; status?: string }
    ) => {
      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (categorySlug) {
        const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
        if (cat) where.categoryId = cat.id;
      }
      return prisma.article.findMany({
        where,
        take: Math.min(limit, 100),
        skip: offset,
        orderBy: { updatedAt: "desc" },
        include: { category: true, tags: { include: { tag: true } } },
      });
    },

    category: (_: unknown, { slug }: { slug: string }) =>
      prisma.category.findUnique({ where: { slug } }),

    categories: () => prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),

    tag: (_: unknown, { slug }: { slug: string }) =>
      prisma.tag.findUnique({ where: { slug } }),

    tags: () => prisma.tag.findMany({ orderBy: { name: "asc" } }),

    search: async (_: unknown, { q, limit = 10 }: { q: string; limit?: number }) => {
      if (!q?.trim()) return [];
      return prisma.article.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        take: Math.min(limit, 50),
        select: { id: true, title: true, slug: true, excerpt: true },
      });
    },

    revisions: async (
      _: unknown,
      { articleSlug, limit = 10 }: { articleSlug?: string; limit?: number }
    ) => {
      const where: Record<string, unknown> = {};
      if (articleSlug) {
        const art = await prisma.article.findUnique({ where: { slug: articleSlug } });
        if (art) where.articleId = art.id;
      }
      const revs = await prisma.articleRevision.findMany({
        where,
        take: Math.min(limit, 100),
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      });
      return revs.map((r) => ({
        id: r.id,
        articleId: r.articleId,
        editSummary: r.editSummary,
        createdAt: r.createdAt.toISOString(),
        author: r.user?.username ?? null,
      }));
    },

    stats: async () => {
      const [articles, categories, tags, users, revisions] = await Promise.all([
        prisma.article.count({ where: { status: "published" } }),
        prisma.category.count(),
        prisma.tag.count(),
        prisma.user.count(),
        prisma.articleRevision.count(),
      ]);
      return { articles, categories, tags, users, revisions };
    },
  },

  Article: {
    createdAt: (a: { createdAt: Date }) => a.createdAt.toISOString(),
    updatedAt: (a: { updatedAt: Date }) => a.updatedAt.toISOString(),
    tags: (a: { tags?: { tag: { id: string; name: string; slug: string; color: string | null } }[] }) =>
      (a.tags ?? []).map((t) => t.tag),
  },

  Category: {
    articles: (
      cat: { id: string },
      { limit = 20, offset = 0 }: { limit?: number; offset?: number }
    ) =>
      prisma.article.findMany({
        where: { categoryId: cat.id, status: "published" },
        take: Math.min(limit, 100),
        skip: offset,
        orderBy: { updatedAt: "desc" },
        include: { category: true, tags: { include: { tag: true } } },
      }),
  },
};

// ─── Yoga instance (reused across requests) ──────────────────────────────────

const schema = createSchema({ typeDefs, resolvers });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yoga = createYoga<any>({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  context: async () => {
    const session = await getSession();
    return { session };
  },
});

// ─── Next.js handlers ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  return yoga.fetch(request);
}

export async function POST(request: NextRequest) {
  return yoga.fetch(request);
}

export const dynamic = "force-dynamic";
