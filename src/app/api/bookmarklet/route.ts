import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * POST /api/bookmarklet
 * Accepts: { url, title, selectedText?, fullHtml? }
 * Creates a draft article from the clipped page.
 * Auth: session cookie (user must be logged in).
 */
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { url, title, selectedText, fullHtml } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Build content: prefer selected text, fall back to note with URL
  let content: string;
  if (selectedText?.trim()) {
    content = `<blockquote>${selectedText.trim()}</blockquote>\n<p>Source: <a href="${url}">${url}</a></p>`;
  } else if (fullHtml?.trim()) {
    // Basic sanitisation: strip scripts and styles, keep structure
    content = fullHtml
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .trim();
    content += `\n<hr/>\n<p>Source: <a href="${url}">${url}</a></p>`;
  } else {
    content = `<p>Saved from: <a href="${url}">${url}</a></p>`;
  }

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  let slug = baseSlug || "clipped-page";
  let attempt = 0;
  while (await prisma.article.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const article = await prisma.article.create({
    data: {
      title: title.trim(),
      slug,
      content,
      excerpt: (selectedText ?? "").slice(0, 200) || null,
      status: "draft",
      userId: user.id,
    },
    select: { id: true, slug: true, title: true },
  });

  return NextResponse.json(article, { status: 201 });
}

export const dynamic = "force-dynamic";
