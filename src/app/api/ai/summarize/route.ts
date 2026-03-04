import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { summarizeArticle } from "@/lib/ai";

// POST /api/ai/summarize
// Fetches an article by ID, summarizes it, and returns the summary.
// Authentication required.
// Body: { articleId: string }
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (!process.env.AI_API_KEY) {
    return NextResponse.json(
      { error: "AI features are not configured on this server" },
      { status: 501 }
    );
  }

  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId as string },
      select: { id: true, title: true, content: true, status: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Non-admins cannot summarize non-published articles
    if (article.status !== "published" && session.role !== "admin" && session.role !== "editor") {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const summary = await summarizeArticle(article.content);

    if (summary === null) {
      return NextResponse.json(
        { error: "AI summarization is not available" },
        { status: 503 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Failed to summarize article:", error);
    return NextResponse.json(
      { error: "Failed to summarize article" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
