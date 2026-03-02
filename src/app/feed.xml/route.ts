import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { config } from "@/lib/config";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      updatedAt: true,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const items = articles
    .map((article) => {
      const description =
        article.excerpt || stripHtml(article.content).substring(0, 200);
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(`${baseUrl}/articles/${article.slug}`)}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${article.updatedAt.toUTCString()}</pubDate>
      <guid>${escapeXml(`${baseUrl}/articles/${article.slug}`)}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.name)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
