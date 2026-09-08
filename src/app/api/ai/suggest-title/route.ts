import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/suggest-title
 * Body: { currentTitle: string; content: string }
 * Returns: { suggestions: string[] }
 */
export async function POST(request: NextRequest) {
  const { currentTitle, content } = await request.json();
  if (!currentTitle?.trim() && !content?.trim()) {
    return NextResponse.json({ error: "currentTitle or content required" }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestions: [], source: "none" });
  }

  const plainText = content ? content.replace(/<[^>]*>/g, " ").slice(0, 2000) : "";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a wiki article title assistant. Return only a JSON array of 5 concise, encyclopedic title suggestions.",
        },
        {
          role: "user",
          content: `Suggest 5 alternative titles for this wiki article. Titles should be concise, encyclopedic, and informative.\n\nCurrent title: ${currentTitle}\nArticle excerpt: ${plainText}\n\nRespond with ONLY a JSON array of 5 strings, like: ["Title 1","Title 2","Title 3","Title 4","Title 5"]`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ suggestions: [], source: "error" });
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  let suggestions: string[] = [];
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end > start) suggestions = JSON.parse(text.slice(start, end + 1));
  } catch { /* fallback */ }

  return NextResponse.json({ suggestions: suggestions.slice(0, 5), source: "ai" });
}
