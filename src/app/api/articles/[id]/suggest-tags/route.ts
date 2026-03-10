import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const dynamic = "force-dynamic";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { title: true, content: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get existing tags for context
  const existingTags = await prisma.tag.findMany({ select: { name: true }, take: 100 });
  const tagList = existingTags.map((t) => t.name).join(", ");

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestions: [] });
  }

  const plainText = stripHtml(article.content).slice(0, 2000);

  try {
    const anthropic = createAnthropic({ apiKey });
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt:
        `Suggest 3-6 relevant tags for this wiki article titled "${article.title}".\n\n` +
        `Article content:\n${plainText}\n\n` +
        `Existing tags in the wiki (prefer these if relevant): ${tagList}\n\n` +
        `Return ONLY a JSON array of tag name strings, no explanation. Example: ["tag1","tag2","tag3"]`,
    });

    let suggestions: string[] = [];
    try {
      const cleaned = text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
      suggestions = JSON.parse(cleaned);
      if (!Array.isArray(suggestions)) suggestions = [];
    } catch {
      // parse failed — return empty
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 6) });
  } catch (err) {
    console.error("Auto-tagging failed:", err);
    return NextResponse.json({ suggestions: [] });
  }
}
