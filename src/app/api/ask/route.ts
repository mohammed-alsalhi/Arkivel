import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { semanticSearch } from "@/lib/embeddings";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

type HistoryMessage = { role: "user" | "assistant"; content: string };

/**
 * POST /api/ask
 * Body: { message: string; history?: HistoryMessage[] }
 *
 * Returns a text/event-stream with:
 *   data: {"type":"sources","sources":[{title,slug,excerpt}]}
 *   data: {"type":"token","token":"..."}
 *   data: [DONE]
 */
export async function POST(request: NextRequest) {
  const { message, history = [] }: { message: string; history?: HistoryMessage[] } =
    await request.json();

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
  }

  // Find relevant articles: try semantic search first, fallback to keyword
  let articleIds: string[] = [];
  const semantic = await semanticSearch(message, 6);
  if (semantic.length > 0) {
    articleIds = semantic.map((r) => r.id);
  } else {
    const words = message.trim().split(/\s+/).filter(Boolean).slice(0, 6);
    const fallback = await prisma.article.findMany({
      where: {
        status: "published",
        OR: words.flatMap((w) => [
          { title: { contains: w, mode: "insensitive" } },
          { content: { contains: w, mode: "insensitive" } },
        ]),
      },
      select: { id: true },
      take: 6,
    });
    articleIds = fallback.map((a) => a.id);
  }

  const articles = articleIds.length
    ? await prisma.article.findMany({
        where: { id: { in: articleIds } },
        select: { id: true, title: true, slug: true, content: true, excerpt: true },
      })
    : [];

  const sources = articles.map((a) => ({
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt || stripHtml(a.content).slice(0, 120),
  }));

  const context = articles
    .map((a) => `### ${a.title}\n${stripHtml(a.content).slice(0, 1200)}`)
    .join("\n\n---\n\n");

  const apiKey = process.env.AI_API_KEY;
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    async start(controller) {
      // Always emit sources first
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`)
      );

      if (!apiKey) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "token",
              token:
                "AI is not configured. Set the AI_API_KEY environment variable to enable the wiki oracle.",
            })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }

      const anthropic = createAnthropic({ apiKey });

      const systemPrompt = `You are the intelligent oracle of a personal knowledge wiki. Your purpose is to answer questions using the wiki content as your primary source of truth.

Guidelines:
- Answer thoroughly but concisely
- Cite which wiki articles your information comes from (use article titles in **bold**)
- If the wiki doesn't contain sufficient information, say so and offer what you do know
- Use markdown formatting: **bold**, bullet points, headings where helpful
- If asked to compare, contrast, or synthesize across articles, do so thoughtfully${
        context
          ? `\n\nWiki articles retrieved for this query:\n\n${context}`
          : "\n\nNo relevant articles were found in the wiki for this query."
      }`;

      const messages = [
        ...history.slice(-10).map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user" as const, content: message.trim() },
      ];

      try {
        const result = streamText({
          model: anthropic("claude-haiku-4-5-20251001"),
          system: systemPrompt,
          messages,
          maxOutputTokens: 1000,
        });

        for await (const chunk of result.textStream) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "token", token: chunk })}\n\n`)
          );
        }
      } catch (err) {
        console.error("Ask stream error:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "token", token: "\n\n[Error: AI request failed]" })}\n\n`
          )
        );
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
