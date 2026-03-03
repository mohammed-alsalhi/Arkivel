import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { upsertArticleEmbedding } from "@/lib/embeddings";

/** POST /api/ai/embeddings — generate/update embedding for a single article. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { articleId } = await request.json();
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  await upsertArticleEmbedding(articleId);
  return NextResponse.json({ success: true });
}

/** GET /api/ai/embeddings — list articles that are missing embeddings. */
export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const [articles, embeddings] = await Promise.all([
    prisma.article.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true },
    }),
    prisma.articleEmbedding.findMany({ select: { articleId: true } }),
  ]);

  const embeddedIds = new Set(embeddings.map((e) => e.articleId));
  const missing = articles.filter((a) => !embeddedIds.has(a.id));

  return NextResponse.json({
    total: articles.length,
    embedded: articles.length - missing.length,
    missing,
  });
}
