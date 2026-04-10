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

  const { categoryId } = await req.json();
  if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      articles: {
        where: { status: "published" },
        select: { title: true, excerpt: true },
        orderBy: { title: "asc" },
        take: 30,
      },
    },
  });

  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const articleList = category.articles
    .map((a) => `- ${a.title}${a.excerpt ? `: ${a.excerpt}` : ""}`)
    .join("\n");

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are an encyclopedia editor writing an introduction for a category page.
Write a clear, informative prose introduction (2-4 paragraphs) that:
- Explains what this category covers and why it exists
- Highlights the scope and range of articles within it
- Draws connections between the articles where relevant
- Provides useful context for a reader exploring this topic area

Write in an encyclopedic, neutral tone. Output plain text only — no HTML, no markdown.`,
    prompt: `Category name: "${category.name}"

Articles in this category:
${articleList || "(No published articles yet)"}

Write an introductory overview for this category page.`,
  });

  return NextResponse.json({ overview: text.trim() });
}
