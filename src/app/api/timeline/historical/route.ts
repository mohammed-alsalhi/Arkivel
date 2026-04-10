import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Extract years from HTML text in range [800, currentYear+5] */
function extractYears(html: string, title: string): number[] {
  const text = (html.replace(/<[^>]+>/g, " ") + " " + title).replace(/\s+/g, " ");
  const years = new Set<number>();
  const currentYear = new Date().getFullYear();
  const yearRegex = /\b(8[0-9]{2}|9[0-9]{2}|1[0-9]{3}|20[0-2][0-9])\b/g;
  let m: RegExpExecArray | null;
  while ((m = yearRegex.exec(text)) !== null) {
    const y = parseInt(m[1]);
    if (y >= 800 && y <= currentYear + 5) years.add(y);
  }
  return Array.from(years).sort((a, b) => a - b);
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      createdAt: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  const events: {
    year: number;
    title: string;
    slug: string;
    excerpt: string | null;
    category: { id: string; name: string; slug: string } | null;
  }[] = [];

  for (const article of articles) {
    const years = extractYears(article.content, article.title);
    if (years.length === 0) continue;

    // Use the earliest year that's not just the article's own creation year
    const createdYear = article.createdAt.getFullYear();
    const best = years.find((y) => y !== createdYear) ?? years[0];

    events.push({
      year: best,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
    });
  }

  events.sort((a, b) => a.year - b.year);

  const years = events.map((e) => e.year);
  const minYear = years.length > 0 ? Math.min(...years) : 1900;
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

  // Group by century then decade
  const grouped: Record<number, Record<number, typeof events>> = {};
  for (const e of events) {
    const century = Math.floor(e.year / 100) * 100;
    const decade = Math.floor(e.year / 10) * 10;
    if (!grouped[century]) grouped[century] = {};
    if (!grouped[century][decade]) grouped[century][decade] = [];
    grouped[century][decade].push(e);
  }

  return NextResponse.json({ events, minYear, maxYear, grouped });
}
