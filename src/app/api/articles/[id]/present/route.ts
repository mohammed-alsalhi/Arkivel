import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/articles/[id]/present
 * Returns article content split into slides by H2/H3 headings.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { title: true, content: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slides = htmlToSlides(article.title, article.content);
  return NextResponse.json({ title: article.title, slides });
}

interface Slide {
  title: string;
  content: string;
}

function htmlToSlides(articleTitle: string, html: string): Slide[] {
  const slides: Slide[] = [];

  // Split by H2 or H3 headings
  const parts = html.split(/(<h[23][^>]*>.*?<\/h[23]>)/gi);

  // First slide = article title + any intro content before first heading
  let intro = "";
  let i = 0;

  // Collect content before first heading
  while (i < parts.length && !parts[i].match(/^<h[23]/i)) {
    intro += parts[i];
    i++;
  }

  slides.push({ title: articleTitle, content: intro.trim() });

  // Remaining slides
  while (i < parts.length) {
    const heading = parts[i];
    const headingText = heading.replace(/<[^>]+>/g, "").trim();
    i++;
    let body = "";
    while (i < parts.length && !parts[i].match(/^<h[23]/i)) {
      body += parts[i];
      i++;
    }
    slides.push({ title: headingText, content: body.trim() });
  }

  return slides.filter((s) => s.title || s.content);
}

export const dynamic = "force-dynamic";
