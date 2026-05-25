import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { estimateContributionSpamScore, moderationStateForSpamScore } from "@/lib/moderation";

export const dynamic = "force-dynamic";

/**
 * GET /api/suggestions — admin: list all suggestions (optionally filtered by status/assignee/moderation state)
 * POST /api/suggestions — public: submit a suggestion for an article
 */

export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending";
  const assigneeId = searchParams.get("assigneeId");
  const moderationState = searchParams.get("moderationState");

  const suggestions = await prisma.editSuggestion.findMany({
    where: {
      ...(status === "all" ? {} : { status }),
      ...(assigneeId ? { assigneeId } : {}),
      ...(moderationState ? { moderationState } : {}),
    },
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

  const trimmedSuggestion = suggestion.trim();
  const trimmedAuthor = author?.trim() || "Anonymous";
  const trimmedEmail = email?.trim() || null;
  const spamScore = estimateContributionSpamScore({ author: trimmedAuthor, email: trimmedEmail, content: trimmedSuggestion });
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");

  const created = await prisma.editSuggestion.create({
    data: {
      articleId,
      author: trimmedAuthor,
      email: trimmedEmail,
      suggestion: trimmedSuggestion,
      spamScore,
      moderationState: moderationStateForSpamScore(spamScore),
      ipAddress,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
