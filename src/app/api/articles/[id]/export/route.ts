import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") || "markdown";

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (format === "markdown") {
    const md = article.contentRaw || article.content.replace(/<[^>]*>/g, "");
    const header = `# ${article.title}\n\n`;
    const meta = `**Category:** ${article.category?.name || "None"}\n**Tags:** ${article.tags.map((t) => t.tag.name).join(", ") || "None"}\n\n---\n\n`;
    const body = header + meta + md;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${article.slug}.md"`,
      },
    });
  }

  // HTML format
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${article.title}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#333}h1{border-bottom:1px solid #ccc;padding-bottom:0.5rem}</style>
</head><body>
<h1>${article.title}</h1>
<p><small>Category: ${article.category?.name || "None"} | Tags: ${article.tags.map((t) => t.tag.name).join(", ") || "None"}</small></p>
<hr>
${article.content}
</body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="${article.slug}.html"`,
    },
  });
}

export const dynamic = "force-dynamic";
