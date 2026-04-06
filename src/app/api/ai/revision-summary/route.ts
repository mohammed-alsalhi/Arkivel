import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { stripHtml } from "@/lib/writing-coach";

/**
 * POST /api/ai/revision-summary
 * Body: { title, oldContent, newContent }
 * Returns: { summary } — a concise one-line edit summary.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 501 });
  }

  const { title, oldContent, newContent } = await request.json();
  if (!newContent) {
    return NextResponse.json({ error: "newContent required" }, { status: 400 });
  }

  const oldText = oldContent ? stripHtml(oldContent).slice(0, 1500) : "(new article)";
  const newText = stripHtml(newContent).slice(0, 1500);

  const anthropic = createAnthropic({ apiKey });

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt: `You are a wiki editor assistant. Summarise the changes between the old and new version of the article titled "${title}" in ONE concise sentence (max 15 words). Focus on what was added, removed, or changed. Output only the summary sentence, no punctuation at the end.

Old version:
${oldText}

New version:
${newText}`,
    });

    const summary = text.trim().replace(/\.$/, "");
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Revision summary failed:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
