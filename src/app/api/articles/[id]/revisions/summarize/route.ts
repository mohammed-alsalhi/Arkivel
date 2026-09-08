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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const { revisionId, compareToId } = await request.json();

  if (!revisionId) {
    return NextResponse.json({ error: "revisionId is required" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id },
    select: { title: true, content: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const targetRevision = await prisma.articleRevision.findUnique({
    where: { id: revisionId },
    select: { content: true },
  });
  if (!targetRevision) return NextResponse.json({ error: "Revision not found" }, { status: 404 });

  let oldContent = article.content;
  if (compareToId) {
    const compareRev = await prisma.articleRevision.findUnique({
      where: { id: compareToId },
      select: { content: true },
    });
    if (compareRev) oldContent = compareRev.content;
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      summary: "AI not configured. Set AI_API_KEY to enable revision summaries.",
    });
  }

  const oldText = stripHtml(oldContent).slice(0, 3000);
  const newText = stripHtml(targetRevision.content).slice(0, 3000);

  try {
    const anthropic = createAnthropic({ apiKey });
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt:
        `You are summarizing changes to a wiki article titled "${article.title}". ` +
        `Summarize in 2-3 plain English sentences what changed between the two versions. ` +
        `Focus on content changes, not formatting. Be specific.\n\n` +
        `OLD VERSION:\n${oldText}\n\nNEW VERSION:\n${newText}`,
    });
    return NextResponse.json({ summary: text.trim() });
  } catch (err) {
    console.error("Revision summarization failed:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
