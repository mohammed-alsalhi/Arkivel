import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/suggest-category
 * Body: { title: string; content: string }
 * Returns: { suggestion: { id: string; name: string } | null; source: string }
 */
export async function POST(request: NextRequest) {
  const { title, content } = await request.json();
  if (!title?.trim() && !content?.trim()) {
    return NextResponse.json({ error: "title or content required" }, { status: 400 });
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    return NextResponse.json({ suggestion: null, source: "none" });
  }

  const plainText = content ? content.replace(/<[^>]*>/g, " ").slice(0, 1500) : "";
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ suggestion: null, source: "none" });
  }

  const catNames = categories.map((c) => c.name).join(", ");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a categorization assistant. Respond with only the exact category name.",
        },
        {
          role: "user",
          content: `Which one category from this list best fits the following wiki article?\n\nArticle title: ${title}\nArticle excerpt: ${plainText}\n\nAvailable categories: ${catNames}\n\nRespond with ONLY the exact category name. No explanation.`,
        },
      ],
      max_tokens: 50,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ suggestion: null, source: "error" });
  }

  const data = await res.json();
  const name = (data.choices?.[0]?.message?.content ?? "").trim().replace(/["'.]/g, "");
  const match = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());

  return NextResponse.json({
    suggestion: match ? { id: match.id, name: match.name } : null,
    source: "ai",
  });
}
