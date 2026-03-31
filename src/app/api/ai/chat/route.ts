import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getProvider() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  return createAnthropic({ apiKey });
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * POST /api/ai/chat
 * Body: { message: string; articleSlug?: string; history?: {role: "user"|"assistant"; content: string}[] }
 * Returns: { reply: string; sources: {title: string; slug: string}[] }
 */
export async function POST(request: NextRequest) {
  const { message, articleSlug, history = [] } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const provider = getProvider();

  // Build context: current article + keyword-matched articles
  const articles: { title: string; slug: string; content: string }[] = [];

  if (articleSlug) {
    const current = await prisma.article.findUnique({
      where: { slug: articleSlug },
      select: { title: true, slug: true, content: true },
    });
    if (current) articles.push(current);
  }

  // Find related articles via keyword search
  const words = message.trim().split(/\s+/).filter(Boolean).slice(0, 5);
  if (words.length > 0) {
    const related = await prisma.article.findMany({
      where: {
        status: "published",
        slug: articleSlug ? { not: articleSlug } : undefined,
        OR: words.map((w: string) => ({
          OR: [
            { title: { contains: w, mode: "insensitive" } },
            { content: { contains: w, mode: "insensitive" } },
          ],
        })),
      },
      select: { title: true, slug: true, content: true },
      take: 3,
    });
    articles.push(...related);
  }

  const sources = articles.map((a) => ({ title: a.title, slug: a.slug }));

  if (!provider) {
    return NextResponse.json({
      reply: "AI is not configured. Add an AI_API_KEY environment variable to enable the chat assistant.",
      sources: [],
    });
  }

  const context = articles
    .map((a) => `### ${a.title}\n${stripHtml(a.content).slice(0, 600)}`)
    .join("\n\n");

  const systemPrompt = `You are a helpful wiki assistant. Answer questions using ONLY the wiki content provided. Be concise and helpful. If the answer is not in the wiki, say so honestly. Do not make up information.${context ? `\n\nWiki content:\n${context}` : ""}`;

  const messages = [
    ...history.slice(-6).map((h: { role: string; content: string }) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user" as const, content: message.trim() },
  ];

  try {
    const { text } = await generateText({
      model: provider("claude-haiku-4-5-20251001"),
      system: systemPrompt,
      messages,
      maxOutputTokens: 300,
    });

    return NextResponse.json({ reply: text.trim(), sources });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
