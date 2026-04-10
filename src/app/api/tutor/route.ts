import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const dynamic = "force-dynamic";

const SYSTEM = `You are a Socratic tutor helping a student master the content of a wiki article.

Your approach:
1. Ask probing questions that make the student think deeply about the material.
2. When they answer, give brief encouraging feedback, then ask a follow-up or move to a new concept.
3. Periodically test comprehension with direct questions: "Can you explain X in your own words?"
4. Point out misconceptions gently: "Close — but consider that..."
5. After ~5 exchanges, offer a summary of what the student has mastered and what to review.
6. Never just lecture. Keep responses SHORT (2-4 sentences max). Ask one question at a time.
7. Format: plain prose, no bullet lists, no markdown headers.

Begin by asking the student what they already know about the topic before diving in.`;

type Message = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY required" }, { status: 503 });
  }

  const { articleId, messages } = await request.json() as {
    articleId: string;
    messages: Message[];
  };

  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { title: true, content: true, excerpt: true },
  });
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  // Strip HTML for the context
  const articleText = article.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  const anthropic = createAnthropic({ apiKey: anthropicKey });

  const systemWithContext = `${SYSTEM}

ARTICLE CONTEXT:
Title: ${article.title}
${article.excerpt ? `Summary: ${article.excerpt}\n` : ""}
Full content:
${articleText}`;

  const inputMessages: Message[] = messages.length > 0
    ? messages
    : [{ role: "user", content: "I want to study this article. Let's begin." }];

  const { text: reply } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemWithContext,
    messages: inputMessages,
  });

  return NextResponse.json({ reply: reply.trim() });
}
