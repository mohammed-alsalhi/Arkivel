import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function POST(
  _req: NextRequest,
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

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const anthropic = createAnthropic({ apiKey });
  const plainText = stripHtml(article.content).slice(0, 4000);

  try {
    const [longResult, shortResult] = await Promise.all([
      generateText({
        model: anthropic("claude-haiku-4-5"),
        prompt: `Summarize this wiki article titled "${article.title}" in 2-3 sentences:\n\n${plainText}`,
      }),
      generateText({
        model: anthropic("claude-haiku-4-5"),
        prompt: `Summarize this wiki article titled "${article.title}" in one sentence (max 160 characters):\n\n${plainText}`,
      }),
    ]);

    const summary = longResult.text.trim();
    const summaryShort = shortResult.text.trim().slice(0, 160);

    await prisma.article.update({
      where: { id },
      data: { summary, summaryShort },
    });

    return NextResponse.json({ summary, summaryShort });
  } catch (err) {
    console.error("Summarization failed:", err);
    return NextResponse.json({ error: "Summarization failed" }, { status: 500 });
  }
}
