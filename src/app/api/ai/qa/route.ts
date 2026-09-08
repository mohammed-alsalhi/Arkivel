import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import prisma from "@/lib/prisma";

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

export async function POST(request: NextRequest) {
  const provider = getProvider();
  if (!provider) {
    return NextResponse.json({ error: "AI not configured" }, { status: 501 });
  }

  const { question } = await request.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  // Find relevant articles via keyword search
  const words = question.trim().split(/\s+/).filter(Boolean);
  const articles = await prisma.article.findMany({
    where: {
      status: "published",
      AND: words.map((w: string) => ({
        OR: [
          { title: { contains: w, mode: "insensitive" } },
          { content: { contains: w, mode: "insensitive" } },
        ],
      })),
    },
    select: { id: true, title: true, slug: true, content: true, excerpt: true },
    take: 5,
  });

  if (articles.length === 0) {
    return NextResponse.json({ answer: null, sources: [] });
  }

  const context = articles
    .map((a) => {
      const text = stripHtml(a.content).slice(0, 800);
      return `### ${a.title}\n${text}`;
    })
    .join("\n\n");

  try {
    const { text } = await generateText({
      model: provider("claude-haiku-4-5-20251001"),
      messages: [
        {
          role: "user",
          content: `You are a helpful wiki assistant. Answer the user's question using ONLY the information provided in the wiki excerpts below. Be concise (1-3 sentences). If the answer cannot be found in the excerpts, say "I couldn't find a direct answer in this wiki."\n\nWiki excerpts:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      maxOutputTokens: 200,
    });

    return NextResponse.json({
      answer: text.trim(),
      sources: articles.map((a) => ({ id: a.id, title: a.title, slug: a.slug })),
    });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
