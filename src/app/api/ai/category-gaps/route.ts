import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * GET /api/ai/category-gaps?categoryId=...
 * Returns AI-suggested sub-topics missing from a category.
 */
export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("categoryId");
  if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });

  const [category, articles] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId }, select: { name: true } }),
    prisma.article.findMany({
      where: { categoryId, status: "published" },
      select: { title: true },
      take: 50,
    }),
  ]);

  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return NextResponse.json({ suggestions: [] });

  const articleTitles = articles.map((a) => a.title).join(", ");

  try {
    const anthropic = createAnthropic({ apiKey });
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt:
        `You are a wiki knowledge architect. The category "${category.name}" currently contains these articles: ${articleTitles || "none"}.\n\nSuggest 6 important sub-topics or articles that are missing from this category. Return only the topic titles, one per line, no numbering or extra text.`,
    });

    const suggestions = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 6);

    return NextResponse.json({ suggestions, categoryName: category.name });
  } catch (err) {
    console.error("Category gaps AI call failed:", err);
    return NextResponse.json({ suggestions: [] });
  }
}

export const dynamic = "force-dynamic";
