import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const anthropic = createAnthropic();

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, html } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const plainText = (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  // Find potential wiki links: get all article titles and check which ones appear in content
  const allArticles = await prisma.article.findMany({
    select: { title: true, slug: true },
    where: { status: "published" },
  });

  // Detect titles mentioned in text but not yet linked
  const existingLinks = new Set<string>(
    (html ?? "").match(/data-wiki-link="([^"]+)"/g)?.map((m: string) => m.replace(/data-wiki-link="|"/g, "")) ?? []
  );

  const wikiLinkSuggestions = allArticles
    .filter((a) => {
      if (existingLinks.has(a.slug)) return false;
      if (a.title.toLowerCase() === title.toLowerCase()) return false;
      return plainText.toLowerCase().includes(a.title.toLowerCase());
    })
    .slice(0, 8);

  // Find related articles by title/keyword overlap
  const titleWords = title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const relatedArticles = allArticles
    .filter((a) => {
      if (a.title.toLowerCase() === title.toLowerCase()) return false;
      const aWords = a.title.toLowerCase().split(/\s+/);
      return titleWords.some((w: string) => aWords.includes(w));
    })
    .slice(0, 6);

  // AI: suggest missing sections based on title + current content
  let missingSections: string[] = [];
  if (wordCount > 50) {
    try {
      const { text } = await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        system: `You are an encyclopedia editor reviewing a draft article. Given the article title and current content, suggest 3-5 important sections or topics that are missing or underdeveloped. Be specific and concise.

Respond with a JSON array of short strings (under 60 chars each). Example: ["Add section on historical context","Missing: reception and criticism","Consider adding a timeline"]`,
        prompt: `Title: "${title}"\n\nCurrent content (${wordCount} words):\n${plainText.slice(0, 1500)}`,
      });
      const clean = text.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) {
        missingSections = parsed.filter((s: unknown) => typeof s === "string").slice(0, 5);
      }
    } catch { /* ignore */ }
  }

  return NextResponse.json({
    wikiLinkSuggestions,
    relatedArticles,
    missingSections,
    wordCount,
  });
}
