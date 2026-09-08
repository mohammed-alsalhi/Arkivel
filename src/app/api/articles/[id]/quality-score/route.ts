import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function computeQualityScore(article: {
  content: string;
  excerpt: string | null;
  updatedAt: Date;
}) {
  const text = stripHtml(article.content);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const linkCount = (article.content.match(/data-wiki-link=/g) || []).length;
  const imageCount = (article.content.match(/<img/g) || []).length;
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(article.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const wcScore = wordCount > 150 ? 20 : wordCount > 50 ? 10 : 0;
  const linkScore = linkCount >= 3 ? 20 : linkCount >= 1 ? 10 : 0;
  const imgScore = imageCount >= 2 ? 20 : imageCount === 1 ? 10 : 0;
  const freshScore = daysSinceUpdate < 90 ? 20 : daysSinceUpdate < 365 ? 10 : 0;
  const excerptScore = article.excerpt ? 20 : 0;

  const score = wcScore + linkScore + imgScore + freshScore + excerptScore;
  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";

  return {
    score,
    label,
    breakdown: {
      wordCount: wcScore,
      links: linkScore,
      images: imgScore,
      freshness: freshScore,
      excerpt: excerptScore,
    },
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { content: true, excerpt: true, updatedAt: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(computeQualityScore(article));
}
