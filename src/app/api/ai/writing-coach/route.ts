import { NextRequest, NextResponse } from "next/server";
import { analyzeWriting, computeReadability } from "@/lib/writing-coach";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { stripHtml } from "@/lib/writing-coach";

/**
 * POST /api/ai/writing-coach
 * Body: { html: string, hasExcerpt?: boolean }
 * Returns: { readability, issues, aiSuggestions? }
 */
export async function POST(request: NextRequest) {
  const { html, hasExcerpt } = await request.json();
  if (!html) return NextResponse.json({ error: "html required" }, { status: 400 });

  const readability = computeReadability(html);
  const issues = analyzeWriting(html, hasExcerpt ?? false);

  // Optional Claude suggestions (gated on AI_API_KEY)
  let aiSuggestions: string | null = null;
  const apiKey = process.env.AI_API_KEY;
  if (apiKey && readability.wordCount > 50) {
    try {
      const anthropic = createAnthropic({ apiKey });
      const plainText = stripHtml(html).slice(0, 2000);
      const { text } = await generateText({
        model: anthropic("claude-haiku-4-5"),
        prompt:
          `You are a wiki writing coach. Analyse this article excerpt and give 3 concise bullet-point suggestions to improve clarity, completeness, or structure. Be specific and actionable.\n\nArticle excerpt:\n${plainText}`,
      });
      aiSuggestions = text.trim();
    } catch {
      // AI not available — skip suggestions
    }
  }

  return NextResponse.json({ readability, issues, aiSuggestions });
}
