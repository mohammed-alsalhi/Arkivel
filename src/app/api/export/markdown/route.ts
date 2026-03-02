import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categorySlug = searchParams.get("category");

  const where: Record<string, unknown> = { status: "published" };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { title: "asc" },
    include: { category: true, tags: { include: { tag: true } } },
  });

  const lines: string[] = [];
  const wikiName = process.env.NEXT_PUBLIC_WIKI_NAME || "My Wiki";
  lines.push(`# ${wikiName} Export`);
  lines.push("");
  lines.push(`Exported ${articles.length} article(s) on ${new Date().toISOString().split("T")[0]}`);
  if (categorySlug) {
    lines.push(`Category filter: ${categorySlug}`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // Table of contents
  lines.push("## Table of Contents");
  lines.push("");
  articles.forEach((article, i) => {
    lines.push(`${i + 1}. [${article.title}](#${article.slug})`);
  });
  lines.push("");
  lines.push("---");
  lines.push("");

  // Articles
  for (const article of articles) {
    lines.push(`## ${article.title} {#${article.slug}}`);
    lines.push("");
    if (article.category) {
      lines.push(`**Category:** ${article.category.name}`);
    }
    const tagNames = article.tags.map((at) => at.tag.name);
    if (tagNames.length > 0) {
      lines.push(`**Tags:** ${tagNames.join(", ")}`);
    }
    lines.push("");

    // Use contentRaw (markdown) if available, otherwise strip HTML
    if (article.contentRaw) {
      lines.push(article.contentRaw);
    } else {
      lines.push(stripHtml(article.content));
    }

    lines.push("");
    lines.push("---");
    lines.push("");
  }

  const markdown = lines.join("\n");
  const filename = categorySlug
    ? `wiki-export-${categorySlug}.md`
    : "wiki-export.md";

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<h([1-6])[^>]*>/gi, (_match, level) => "#".repeat(parseInt(level)) + " ")
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
