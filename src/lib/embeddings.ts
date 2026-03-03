import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import prisma from "@/lib/prisma";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return createOpenAI({ apiKey });
}

/** Strip HTML tags and normalise whitespace. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate a text embedding via OpenAI text-embedding-3-small.
 * Returns null when OPENAI_API_KEY is not set.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const openai = getOpenAI();
  if (!openai) return null;

  try {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text.slice(0, 8000),
    });
    return embedding;
  } catch (err) {
    console.error("Embedding generation failed:", err);
    return null;
  }
}

/** Cosine similarity between two vectors (returns −1…1). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Generate and persist an embedding for a given article.
 * No-ops silently when OPENAI_API_KEY is absent.
 */
export async function upsertArticleEmbedding(articleId: string): Promise<void> {
  const openai = getOpenAI();
  if (!openai) return;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { title: true, content: true, excerpt: true },
  });
  if (!article) return;

  const text = [article.title, article.excerpt, stripHtml(article.content)]
    .filter(Boolean)
    .join(" ");

  const embedding = await generateEmbedding(text);
  if (!embedding) return;

  await prisma.articleEmbedding.upsert({
    where: { articleId },
    create: { articleId, embedding },
    update: { embedding },
  });
}

/**
 * Find the top-N most semantically similar articles to a query.
 * Returns [] when embeddings are unavailable.
 */
export async function semanticSearch(
  query: string,
  limit = 10
): Promise<Array<{ id: string; title: string; slug: string; similarity: number }>> {
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) return [];

  const rows = await prisma.articleEmbedding.findMany({
    include: { article: { select: { id: true, title: true, slug: true, status: true } } },
  });

  return rows
    .filter((r) => r.article.status === "published")
    .map((r) => ({
      id: r.article.id,
      title: r.article.title,
      slug: r.article.slug,
      similarity: cosineSimilarity(queryEmbedding, r.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
