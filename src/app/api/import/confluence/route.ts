import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

/**
 * POST /api/import/confluence
 *
 * Accepts a Confluence HTML export body (the content of a single exported page).
 * Body: { html: string, categoryId?: string }
 *
 * Confluence exports wrap page content in:
 *   <div id="main-content"> ... </div>
 * The <title> tag or <h1 id="title"> holds the page title.
 */
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { html, categoryId } = await request.json();
  if (!html?.trim()) {
    return NextResponse.json({ error: "html is required" }, { status: 400 });
  }

  const { title, content } = parseConfluencePage(html);
  if (!title) {
    return NextResponse.json({ error: "Could not extract page title from HTML" }, { status: 422 });
  }

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  // Ensure unique slug
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.article.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      excerpt: stripHtml(content).slice(0, 200) || null,
      status: "draft",
      userId: user.id,
      categoryId: categoryId ?? undefined,
    },
    select: { id: true, slug: true, title: true },
  });

  return NextResponse.json(article, { status: 201 });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseConfluencePage(html: string): { title: string; content: string } {
  // Extract title: try <title> tag, then <h1 id="title">, then first <h1>
  let title = "";
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleTagMatch) {
    title = titleTagMatch[1].replace(/\s*[-|]\s*Confluence.*$/i, "").trim();
  }
  if (!title) {
    const h1Match = html.match(/<h1[^>]*id=["']title["'][^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) title = stripHtml(h1Match[1]).trim();
  }
  if (!title) {
    const h1Any = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Any) title = stripHtml(h1Any[1]).trim();
  }

  // Extract content: prefer #main-content div, fallback to #content, fallback to <body>
  let content = "";
  const mainMatch = html.match(/<div[^>]+id=["']main-content["'][^>]*>([\s\S]*?)<\/div>\s*(?=<div|<\/body)/i)
    ?? html.match(/<div[^>]+id=["']main-content["'][^>]*>([\s\S]*)/i);
  if (mainMatch) {
    content = mainMatch[1];
  } else {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    content = bodyMatch ? bodyMatch[1] : html;
  }

  // Clean up Confluence-specific markup
  content = cleanConfluenceHtml(content);

  return { title, content };
}

function cleanConfluenceHtml(html: string): string {
  return html
    // Remove Confluence macros / metadata divs
    .replace(/<div[^>]+class=["'][^"']*(?:page-metadata|breadcrumb-section|aui-message|confluence-information-macro)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "")
    // Remove empty paragraphs
    .replace(/<p[^>]*>\s*<\/p>/gi, "")
    // Remove Confluence user mentions
    .replace(/<a[^>]+class=["'][^"']*confluence-userlink[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "")
    // Strip style attributes (keep classes for now)
    .replace(/\s+style=["'][^"']*["']/gi, "")
    // Remove script/style tags
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // Convert Confluence code blocks to <pre><code>
    .replace(/<div[^>]+class=["'][^"']*code[^"']*["'][^>]*><pre>([\s\S]*?)<\/pre><\/div>/gi, "<pre><code>$1</code></pre>")
    .trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export const dynamic = "force-dynamic";
