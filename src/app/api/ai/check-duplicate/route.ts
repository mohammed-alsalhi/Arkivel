import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, cosineSimilarity } from "@/lib/embeddings";
import { stripHtml } from "@/lib/writing-coach";
import prisma from "@/lib/prisma";

const DUPLICATE_THRESHOLD = 0.88;

/**
 * POST /api/ai/check-duplicate
 * Body: { content: string, excludeId?: string }
 * Returns: { isDuplicate, similarity, matchTitle, matchSlug }
 */
export async function POST(request: NextRequest) {
  const { content, excludeId } = await request.json();
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

  const plainText = stripHtml(content).slice(0, 4000);
  const queryEmbedding = await generateEmbedding(plainText);

  if (!queryEmbedding) {
    // Embeddings not configured — skip check
    return NextResponse.json({ isDuplicate: false, similarity: 0, matchTitle: null, matchSlug: null });
  }

  const rows = await prisma.articleEmbedding.findMany({
    where: excludeId ? { NOT: { articleId: excludeId } } : {},
    include: { article: { select: { title: true, slug: true } } },
  });

  let best = { similarity: 0, title: "", slug: "" };
  for (const row of rows) {
    const sim = cosineSimilarity(queryEmbedding, row.embedding);
    if (sim > best.similarity) {
      best = { similarity: sim, title: row.article.title, slug: row.article.slug };
    }
  }

  return NextResponse.json({
    isDuplicate: best.similarity >= DUPLICATE_THRESHOLD,
    similarity: Math.round(best.similarity * 100) / 100,
    matchTitle: best.title || null,
    matchSlug: best.slug || null,
  });
}

export const dynamic = "force-dynamic";
