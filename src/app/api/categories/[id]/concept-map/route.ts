/**
 * GET /api/categories/[id]/concept-map
 * Returns nodes (articles in the category) and edges (wiki-link relationships between them).
 */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const articles = await prisma.article.findMany({
    where: { categoryId: id },
    select: { id: true, title: true, slug: true, content: true },
  });

  const articleIds = new Set(articles.map((a) => a.id));

  // Build nodes
  const nodes = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
  }));

  // Build edges: parse [[Title]] wiki links from content, resolve to article in same category
  const slugToId = new Map(articles.map((a) => [a.slug, a.id]));
  const titleToId = new Map(articles.map((a) => [a.title.toLowerCase(), a.id]));

  const edges: { source: string; target: string }[] = [];
  const seenEdges = new Set<string>();

  for (const article of articles) {
    const matches = article.content.matchAll(/data-wiki-link="([^"]+)"/g);
    for (const [, rawSlug] of matches) {
      const targetId = slugToId.get(rawSlug) ?? titleToId.get(rawSlug.toLowerCase());
      if (targetId && targetId !== article.id && articleIds.has(targetId)) {
        const key = [article.id, targetId].sort().join(":");
        if (!seenEdges.has(key)) {
          seenEdges.add(key);
          edges.push({ source: article.id, target: targetId });
        }
      }
    }
  }

  return NextResponse.json({ nodes, edges });
}

export const dynamic = "force-dynamic";
