import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const dynamic = "force-dynamic";

// eslint-disable-next-line react-hooks/purity
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  // 1. Spaced repetition items due today
  const dueItems = await prisma.spacedRepetitionItem.findMany({
    where: { userId: session.id, nextReviewAt: { lte: now } },
    include: { article: { select: { id: true, title: true, slug: true, excerpt: true } } },
    take: 5,
    orderBy: { nextReviewAt: "asc" },
  });

  // 2. Recent articles in watched categories
  const watchedCategories = await prisma.categoryWatch.findMany({
    where: { userId: session.id },
    select: { categoryId: true, category: { select: { name: true, slug: true } } },
  });

  const recentInWatched = watchedCategories.length > 0
    ? await prisma.article.findMany({
        where: {
          categoryId: { in: watchedCategories.map((w) => w.categoryId) },
          status: "published",
          updatedAt: { gte: new Date(now.getTime() - 7 * 86400000) },
        },
        select: {
          id: true, title: true, slug: true, excerpt: true, updatedAt: true,
          category: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      })
    : [];

  // 3. "Did You Know" — 3 AI-generated facts from random articles
  const randomPool = await prisma.article.findMany({
    where: { status: "published" },
    select: { title: true, excerpt: true, content: true, slug: true },
    take: 50,
  });

  const shuffled = [...randomPool].sort(() => Math.random() - 0.5).slice(0, 3);
  let dykFacts: { fact: string; articleTitle: string; articleSlug: string }[] = [];

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && shuffled.length > 0) {
    try {
      const anthropic = createAnthropic({ apiKey: anthropicKey });
      const dykPrompt = shuffled
        .map((a, i) => `[${i}] "${a.title}": ${(a.excerpt || stripHtml(a.content)).slice(0, 300)}`)
        .join("\n\n");

      const { text } = await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        system: `Extract one surprising or interesting fact from each article.
Return ONLY a JSON array: [{"fact": "Did you know that ...", "index": 0}, ...]
Exactly ${shuffled.length} items. Valid JSON only, no markdown.`,
        prompt: dykPrompt,
      });

      const cleaned = text.replace(/^```json?\n?/i, "").replace(/\n?```$/, "").trim();
      const parsed = JSON.parse(cleaned) as { fact: string; index: number }[];
      dykFacts = parsed.map((p) => ({
        fact: p.fact,
        articleTitle: shuffled[p.index]?.title ?? "",
        articleSlug: shuffled[p.index]?.slug ?? "",
      }));
    } catch { /* skip DYK if AI fails */ }
  }

  // 4. Article of the day — unread article, shuffled for variety
  const recentReads = await prisma.articleRead.findMany({
    where: { userId: session.id, readAt: { gte: new Date(now.getTime() - 14 * 86400000) } },
    select: { articleId: true },
  });
  const recentReadIds = new Set(recentReads.map((r) => r.articleId));

  const unread = await prisma.article.findMany({
    where: { status: "published", id: { notIn: [...recentReadIds] } },
    select: {
      id: true, title: true, slug: true, excerpt: true, coverImage: true,
      category: { select: { name: true } },
    },
    take: 20,
  });

  const articleOfDay = unread.length > 0
    ? unread[Math.floor(Math.random() * Math.min(5, unread.length))]
    : null;

  // 5. Thinking prompt — AI generates one open-ended question
  let writingPrompt: string | null = null;
  if (anthropicKey && randomPool.length > 0) {
    try {
      const anthropic = createAnthropic({ apiKey: anthropicKey });
      const sampleTitles = randomPool.slice(0, 8).map((a) => `"${a.title}"`).join(", ");
      const { text } = await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        system: "Generate one short open-ended question that sparks curiosity or reflection about the given topics. One sentence. No preamble.",
        prompt: `Topics in this knowledge base: ${sampleTitles}`,
      });
      writingPrompt = text.trim().replace(/^["']|["']$/g, "");
    } catch { /* skip */ }
  }

  // 6. On-this-day articles (published on today's month/day in past years)
  const todayMD = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const allArticles = await prisma.article.findMany({
    where: { status: "published" },
    select: { id: true, title: true, slug: true, excerpt: true, createdAt: true },
  });
  const onThisDay = allArticles
    .filter((a) => {
      const d = a.createdAt;
      const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return md === todayMD && d.getFullYear() < now.getFullYear();
    })
    .slice(0, 3);

  return NextResponse.json({
    date: now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    dueReviews: dueItems.map((i) => i.article),
    recentInWatched,
    dykFacts,
    articleOfDay,
    writingPrompt,
    onThisDay,
    watchedCount: watchedCategories.length,
  });
}
