import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Rough word count from HTML: strip tags, collapse whitespace, count words
function countWords(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

const BUCKETS = [
  { label: "< 100", min: 0, max: 99 },
  { label: "100–249", min: 100, max: 249 },
  { label: "250–499", min: 250, max: 499 },
  { label: "500–999", min: 500, max: 999 },
  { label: "1 000–1 999", min: 1000, max: 1999 },
  { label: "2 000–4 999", min: 2000, max: 4999 },
  { label: "5 000+", min: 5000, max: Infinity },
];

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: { id: true, title: true, slug: true, content: true },
  });

  const withCounts = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    wordCount: countWords(a.content),
  }));

  const distribution = BUCKETS.map((b) => ({
    label: b.label,
    count: withCounts.filter((a) => a.wordCount >= b.min && a.wordCount <= b.max).length,
  }));

  const sorted = [...withCounts].sort((a, b) => b.wordCount - a.wordCount);
  const total = withCounts.length;
  const avg = total > 0 ? Math.round(withCounts.reduce((s, a) => s + a.wordCount, 0) / total) : 0;

  return NextResponse.json({
    distribution,
    topArticles: sorted.slice(0, 10),
    shortArticles: sorted.slice(-10).reverse(),
    stats: { total, avg, max: sorted[0]?.wordCount ?? 0, min: sorted[sorted.length - 1]?.wordCount ?? 0 },
  });
}
