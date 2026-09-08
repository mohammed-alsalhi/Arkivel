import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * POST /api/ai/synthesize
 * Body: { categoryId: string; title?: string }
 *   OR { articleIds: string[]; title: string }
 *
 * Returns: { title: string; html: string; articleTitles: string[] }
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 501 });
  }

  const body = await request.json();

  let articles: { title: string; content: string }[] = [];
  let synthesisTitle = body.title || "";

  if (body.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
      select: { name: true },
    });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    if (!synthesisTitle) synthesisTitle = `Overview: ${category.name}`;

    const rows = await prisma.article.findMany({
      where: { categoryId: body.categoryId, status: "published" },
      select: { title: true, content: true },
      orderBy: { title: "asc" },
      take: 20,
    });
    articles = rows;
  } else if (Array.isArray(body.articleIds) && body.articleIds.length > 0) {
    const rows = await prisma.article.findMany({
      where: { id: { in: body.articleIds }, status: "published" },
      select: { title: true, content: true },
      take: 20,
    });
    articles = rows;
  } else {
    return NextResponse.json({ error: "categoryId or articleIds required" }, { status: 400 });
  }

  if (articles.length === 0) {
    return NextResponse.json({ error: "No published articles found" }, { status: 404 });
  }

  const articleTitles = articles.map((a) => a.title);

  const context = articles
    .map((a) => `## ${a.title}\n${stripHtml(a.content).slice(0, 800)}`)
    .join("\n\n---\n\n");

  const anthropic = createAnthropic({ apiKey });

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      prompt: `You are writing a comprehensive overview article for a wiki. Using ONLY the source articles provided below, synthesise their key ideas, facts, and relationships into a single well-structured overview article titled "${synthesisTitle}".

Requirements:
- Write in an encyclopedic, neutral tone
- Use <h2> and <h3> headings to organise sections
- Use <p> tags for paragraphs
- Use <ul><li> for bullet lists where appropriate
- Do NOT use markdown — output pure HTML only (no \`\`\`html fences)
- Aim for 400–700 words
- Reference the source article titles where relevant (you may bold them)
- Do NOT invent facts not present in the source articles

Source articles:
${context}`,
      maxOutputTokens: 1500,
    });

    // Strip any accidental markdown code fences
    const html = text
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return NextResponse.json({ title: synthesisTitle, html, articleTitles });
  } catch (err) {
    console.error("Synthesis failed:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
