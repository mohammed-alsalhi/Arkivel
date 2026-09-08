import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI features require OPENAI_API_KEY" }, { status: 503 });
  }

  const { text, instruction } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const prompt = instruction?.trim()
    ? `Rewrite the following text according to this instruction: "${instruction}"\n\nText:\n${text}`
    : `Rewrite the following text to be clearer and more concise while preserving its meaning:\n\n${text}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a writing assistant. Return only the rewritten text, with no preamble or explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "OpenAI request failed" }, { status: 502 });
  }

  const data = await res.json();
  const result = data.choices?.[0]?.message?.content?.trim() ?? "";
  return NextResponse.json({ result });
}
