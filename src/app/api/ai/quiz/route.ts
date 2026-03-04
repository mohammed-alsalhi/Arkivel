import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { stripHtml } from "@/lib/writing-coach";

/**
 * GET /api/ai/quiz?articleId=...
 * Returns 5 multiple-choice questions generated from the article.
 */
export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { title: true, content: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const plainText = stripHtml(article.content).slice(0, 3000);
  const anthropic = createAnthropic({ apiKey });

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt: `Generate 5 multiple-choice quiz questions based on this wiki article titled "${article.title}".

For each question output in this exact JSON format (one object per line, no surrounding array):
{"q":"Question text","options":["A","B","C","D"],"answer":0}

Where "answer" is the 0-based index of the correct option.

Article content:
${plainText}`,
    });

    const questions = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("{"))
      .map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean)
      .slice(0, 5);

    return NextResponse.json({ questions, articleId, title: article.title });
  } catch (err) {
    console.error("Quiz generation failed:", err);
    return NextResponse.json({ error: "Quiz generation failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
