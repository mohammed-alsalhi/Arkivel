import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const dynamic = "force-dynamic";

const LEVEL_PROMPTS: Record<string, string> = {
  beginner: `Rewrite this wiki article so a curious 12-year-old with no background knowledge can understand it.
- Replace jargon with plain English. If you must use a technical term, explain it in parentheses the first time.
- Use short sentences (max 20 words each).
- Replace abstract concepts with concrete everyday analogies.
- Keep all the key facts and information — do not omit important content, just make it accessible.
- Return valid HTML with the same heading structure (h2, h3, p, ul, ol) as the input. No markdown. No preamble.`,

  technical: `Rewrite this wiki article for an expert audience with deep domain knowledge.
- Use precise technical terminology without explanation.
- Add nuance, edge cases, and implementation details where relevant.
- Replace simplified analogies with accurate technical descriptions.
- Expand acronyms on first use then use them freely.
- Return valid HTML with the same heading structure (h2, h3, p, ul, ol) as the input. No markdown. No preamble.`,

  eli5: `Rewrite this wiki article so a 5-year-old could understand it (ELI5 style).
- Use only the most basic words a child knows.
- Use fun, simple analogies like toys, food, or everyday objects.
- Very short sentences. One idea per sentence.
- Keep it friendly and engaging.
- Return valid HTML using only <p> and <ul><li> tags. No headings. No markdown. No preamble.`,
};

export async function POST(request: NextRequest) {
  const { articleId, level } = await request.json();

  if (!articleId || !level) {
    return NextResponse.json({ error: "articleId and level required" }, { status: 400 });
  }

  if (!LEVEL_PROMPTS[level]) {
    return NextResponse.json({ error: "level must be beginner, technical, or eli5" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "AI features require ANTHROPIC_API_KEY" }, { status: 503 });
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { content: true, title: true },
  });
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const anthropic = createAnthropic({ apiKey: anthropicKey });

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: LEVEL_PROMPTS[level],
    prompt: `Article title: ${article.title}\n\n${article.content}`,
  });

  // Strip accidental markdown fences
  const html = text.replace(/^```html?\n?/i, "").replace(/\n?```$/, "").trim();

  return NextResponse.json({ html });
}
