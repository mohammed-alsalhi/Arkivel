import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

/**
 * GET /api/ai/knowledge-gaps
 * Scans all article HTML for data-wiki-link attributes and finds referenced
 * topics that have no corresponding article, sorted by incoming-link count.
 */
export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: { slug: true, content: true, title: true },
  });

  const existingSlugs = new Set(articles.map((a) => a.slug));

  // Count how many articles reference each missing topic
  const gapCounts = new Map<string, { title: string; count: number; referencedBy: string[] }>();

  const wikiLinkRegex = /data-wiki-link="([^"]+)"/g;
  const titleToSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  for (const article of articles) {
    let m: RegExpExecArray | null;
    const seen = new Set<string>();
    while ((m = wikiLinkRegex.exec(article.content)) !== null) {
      const linkedTitle = m[1];
      const linkedSlug = titleToSlug(linkedTitle);
      if (!existingSlugs.has(linkedSlug) && !seen.has(linkedTitle)) {
        seen.add(linkedTitle);
        const existing = gapCounts.get(linkedTitle);
        if (existing) {
          existing.count++;
          existing.referencedBy.push(article.title);
        } else {
          gapCounts.set(linkedTitle, {
            title: linkedTitle,
            count: 1,
            referencedBy: [article.title],
          });
        }
      }
    }
  }

  const gaps = Array.from(gapCounts.values()).sort((a, b) => b.count - a.count);

  return NextResponse.json({ gaps });
}

export const dynamic = "force-dynamic";
