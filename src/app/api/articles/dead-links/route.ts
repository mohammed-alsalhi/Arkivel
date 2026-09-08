import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { id: true, title: true, slug: true, content: true },
  });

  const slugSet = new Set(articles.map((a) => a.slug));
  const titleSet = new Set(articles.map((a) => a.title));
  const results: { articleId: string; articleTitle: string; articleSlug: string; brokenLink: string }[] = [];

  for (const article of articles) {
    const regex = /data-wiki-link="([^"]*)"/g;
    let match;
    while ((match = regex.exec(article.content)) !== null) {
      const linkTitle = match[1];
      const linkSlug = linkTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!titleSet.has(linkTitle) && !slugSet.has(linkSlug)) {
        results.push({
          articleId: article.id,
          articleTitle: article.title,
          articleSlug: article.slug,
          brokenLink: linkTitle,
        });
      }
    }
  }

  return NextResponse.json(results);
}

export const dynamic = "force-dynamic";
