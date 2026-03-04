import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

  const articles = await prisma.article.findMany({
    where: { published: true, status: "published" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/articles</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/categories</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/search</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`;

  for (const article of articles) {
    const lastmod = article.updatedAt.toISOString().split("T")[0];
    xml += `\n  <url><loc>${baseUrl}/articles/${article.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
  }

  for (const cat of categories) {
    xml += `\n  <url><loc>${baseUrl}/categories/${cat.slug}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`;
  }

  xml += "\n</urlset>";

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

export const dynamic = "force-dynamic";
