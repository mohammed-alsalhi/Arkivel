import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/expand
 * Body: { text: string; context?: string }
 * Returns: { expanded: string }
 */
export async function POST(request: NextRequest) {
  const { text, context } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ expanded: "", source: "none" });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a wiki article editor. Expand the given text into a more detailed, well-structured paragraph or section while preserving its style and encyclopedic tone. Return only the expanded text, no extra commentary.",
        },
        {
          role: "user",
          content: context
            ? `Context (the surrounding article excerpt):\n${context.slice(0, 500)}\n\nExpand this section:\n${text}`
            : `Expand this section:\n${text}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ expanded: "", source: "error" });
  }

  const data = await res.json();
  const expanded = data.choices?.[0]?.message?.content?.trim() ?? "";
  return NextResponse.json({ expanded, source: "ai" });
}
