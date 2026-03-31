import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const dynamic = "force-dynamic";

function getProvider() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  return createAnthropic({ apiKey });
}

/**
 * POST /api/ai/generate-article
 * Body: { title: string; headings: string[] }
 * Returns: { html: string }
 *
 * Generates article body HTML for each heading section.
 */
export async function POST(request: NextRequest) {
  const { title, headings } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const provider = getProvider();
  if (!provider) {
    return NextResponse.json({ error: "AI not configured" }, { status: 501 });
  }

  const headingList =
    Array.isArray(headings) && headings.length > 0
      ? headings.join("\n")
      : "## Overview\n## Details\n## See Also";

  try {
    const { text } = await generateText({
      model: provider("claude-haiku-4-5-20251001"),
      messages: [
        {
          role: "user",
          content: `Write a wiki article titled "${title.trim()}" with the following sections:

${headingList}

Rules:
- Write 2-4 sentences per section.
- Return ONLY valid HTML using <h2>, <h3>, and <p> tags. No <html>, <body>, or <head> tags.
- Match each heading exactly as given (same level).
- Do not add extra headings.
- Be factual and encyclopedic in tone.`,
        },
      ],
      maxOutputTokens: 1200,
    });

    // Strip any markdown code fences if the model wraps the output
    const html = text
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
