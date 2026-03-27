import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/suggestions — admin: list all suggestions (optionally filtered by status)
 * POST /api/suggestions — public: submit a suggestion for an article
 */

export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending";

  const suggestions = await prisma.editSuggestion.findMany({
    where: status === "all" ? {} : { status },
    include: { article: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(suggestions);
}

export async function POST(request: NextRequest) {
  const { articleId, author, email, suggestion } = await request.json();
  if (!articleId || !suggestion?.trim()) {
    return NextResponse.json({ error: "articleId and suggestion are required" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const created = await prisma.editSuggestion.create({
    data: {
      articleId,
      author: author?.trim() || "Anonymous",
      email: email?.trim() || null,
      suggestion: suggestion.trim(),
    },
  });

  return NextResponse.json(created, { status: 201 });
}
