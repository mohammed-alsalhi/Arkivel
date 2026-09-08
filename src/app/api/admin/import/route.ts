import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { isAdmin, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type ImportArticle = {
  title: string;
  slug?: string;
  content?: string;
  contentRaw?: string;
  excerpt?: string;
  status?: "draft" | "review" | "published";
  categorySlug?: string;
  tags?: string[];
};

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  let items: ImportArticle[];
  try {
    items = await request.json();
    if (!Array.isArray(items)) throw new Error("Expected an array");
  } catch {
    return NextResponse.json({ error: "Invalid JSON. Expected an array of article objects." }, { status: 400 });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "No articles to import." }, { status: 400 });
  }

  if (items.length > 500) {
    return NextResponse.json({ error: "Maximum 500 articles per import." }, { status: 400 });
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] };

  for (const item of items) {
    if (!item.title || typeof item.title !== "string") {
      results.errors.push(`Skipped item with missing title: ${JSON.stringify(item).slice(0, 60)}`);
      results.skipped++;
      continue;
    }

    const slug = item.slug ? item.slug : generateSlug(item.title);
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      results.errors.push(`Skipped "${item.title}" — slug "${slug}" already exists`);
      results.skipped++;
      continue;
    }

    // Resolve category
    let categoryId: string | undefined;
    if (item.categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: item.categorySlug } });
      if (cat) categoryId = cat.id;
    }

    // Resolve tags (create if not found)
    const tagIds: string[] = [];
    for (const tagName of item.tags ?? []) {
      const tagSlug = generateSlug(tagName);
      let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
      }
      tagIds.push(tag.id);
    }

    try {
      const article = await prisma.article.create({
        data: {
          title: item.title,
          slug,
          content: item.content ?? "",
          contentRaw: item.contentRaw ?? null,
          excerpt: item.excerpt ?? null,
          status: (item.status as "draft" | "review" | "published") ?? "published",
          ...(categoryId ? { categoryId } : {}),
          tags: tagIds.length > 0 ? {
            create: tagIds.map((tagId) => ({ tagId })),
          } : undefined,
        },
      });
      // Create initial revision
      await prisma.articleRevision.create({
        data: {
          articleId: article.id,
          title: article.title,
          content: article.content,
          contentRaw: article.contentRaw ?? null,
          infobox: Prisma.JsonNull,
          editSummary: "Imported",
        },
      });
      results.created++;
    } catch (err) {
      results.errors.push(`Failed to create "${item.title}": ${err instanceof Error ? err.message : "unknown error"}`);
      results.skipped++;
    }
  }

  return NextResponse.json(results);
}
