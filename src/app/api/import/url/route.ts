import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Strip HTML tags, collapse whitespace, limit length */
function extractText(html: string, maxChars = 20000): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxChars);
}

/** Try to extract page title from <title> or <h1> */
function extractTitle(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1].trim();
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (title) return title[1].trim().split("|")[0].split(" - ")[0].trim();
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1[1].trim();
  return "";
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "AI features require ANTHROPIC_API_KEY" }, { status: 503 });
  }

  const { url } = await request.json();
  if (!url?.startsWith("http")) {
    return NextResponse.json({ error: "A valid URL is required" }, { status: 400 });
  }

  // Fetch the URL
  let rawHtml: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WikiBot/1.0; +https://wiki.app)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Could not fetch URL: HTTP ${res.status}` }, { status: 502 });
    }
    rawHtml = await res.text();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? `Fetch failed: ${err.message}` : "Could not fetch URL" },
      { status: 502 }
    );
  }

  const pageTitle = extractTitle(rawHtml);
  const pageText = extractText(rawHtml);

  if (pageText.length < 100) {
    return NextResponse.json({ error: "Page appears to have no readable content" }, { status: 422 });
  }

  const anthropic = createAnthropic({ apiKey: anthropicKey });

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are a wiki editor. Given raw text scraped from a webpage, produce a well-structured wiki article.

Rules:
- Write a concise, encyclopaedic article about the topic of this page.
- Use <h2> for major sections, <h3> for subsections, <p> for paragraphs, <ul><li> for lists.
- Do NOT include navigation, ads, cookie notices, or boilerplate text from the source.
- Do NOT include a <h1> — the title will be set separately.
- Output pure HTML only. No markdown. No preamble. No explanation.
- Keep the article focused and informative. Aim for 300–600 words.`,
    prompt: `Source URL: ${url}
Page title: ${pageTitle}

Raw page text:
${pageText}`,
  });

  const html = text.replace(/^```html?\n?/i, "").replace(/\n?```$/, "").trim();

  // Suggest a title (clean up the page title)
  const title = pageTitle || "Imported Article";

  return NextResponse.json({ title, html, sourceUrl: url });
}
