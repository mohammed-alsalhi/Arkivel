import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/suggest-tags
 * Body: { title: string; content: string; articleId?: string }
 * Returns: { tags: { id: string; name: string }[]; source: "ai"|"keyword"|"none" }
 */
export async function POST(request: NextRequest) {
  const { title, content, articleId } = await request.json();
  if (!title?.trim() && !content?.trim()) {
    return NextResponse.json({ error: "title or content required" }, { status: 400 });
  }

  const allTags = await prisma.tag.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (allTags.length === 0) {
    return NextResponse.json({ tags: [], source: "none" });
  }

  // Get already-applied tags to exclude
  let existing: string[] = [];
  if (articleId) {
    const articleTags = await prisma.articleTag.findMany({
      where: { articleId },
      select: { tag: { select: { name: true } } },
    });
    existing = articleTags.map((at) => at.tag.name.toLowerCase());
  }

  const plainText = content ? content.replace(/<[^>]*>/g, " ").slice(0, 1500) : "";
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback: keyword match
    const text = `${title} ${plainText}`.toLowerCase();
    const matched = allTags
      .filter((t) => !existing.includes(t.name.toLowerCase()) && text.includes(t.name.toLowerCase()))
      .slice(0, 5);
    return NextResponse.json({ tags: matched, source: "keyword" });
  }

  const tagNames = allTags.map((t) => t.name).join(", ");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a tagging assistant. Respond only with a JSON array of tag names from the provided list.",
        },
        {
          role: "user",
          content: `Suggest up to 5 relevant tags for this wiki article from the available tags list.\n\nArticle title: ${title}\nArticle excerpt: ${plainText}\n\nAvailable tags: ${tagNames}\n\nRespond with ONLY a JSON array like: ["tag1","tag2"]`,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    }),
  });

  let suggestedNames: string[] = [];
  if (res.ok) {
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    try {
      const match = text.match(/\[.*\]/);
      if (match) suggestedNames = JSON.parse(match[0]);
    } catch { /* fallback */ }
  }

  const matched = allTags
    .filter((t) => suggestedNames.some((s: string) => s.toLowerCase() === t.name.toLowerCase()))
    .filter((t) => !existing.includes(t.name.toLowerCase()))
    .slice(0, 5);

  return NextResponse.json({ tags: matched, source: "ai" });
}
