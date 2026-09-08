import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { articleIds, tagIds, action } = body;

  if (!Array.isArray(articleIds) || articleIds.length === 0) {
    return NextResponse.json(
      { error: "articleIds must be a non-empty array of article IDs." },
      { status: 400 }
    );
  }

  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    return NextResponse.json(
      { error: "tagIds must be a non-empty array of tag IDs." },
      { status: 400 }
    );
  }

  if (action !== "add" && action !== "remove") {
    return NextResponse.json(
      { error: 'action must be "add" or "remove".' },
      { status: 400 }
    );
  }

  // Validate that referenced articles and tags exist
  const [existingArticles, existingTags] = await Promise.all([
    prisma.article.findMany({
      where: { id: { in: articleIds } },
      select: { id: true },
    }),
    prisma.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true },
    }),
  ]);

  const validArticleIds = new Set(existingArticles.map((a) => a.id));
  const validTagIds = new Set(existingTags.map((t) => t.id));

  const invalidArticles = articleIds.filter((id: string) => !validArticleIds.has(id));
  const invalidTags = tagIds.filter((id: string) => !validTagIds.has(id));

  if (invalidArticles.length > 0 || invalidTags.length > 0) {
    return NextResponse.json(
      {
        error: "Some IDs do not exist.",
        invalidArticles,
        invalidTags,
      },
      { status: 400 }
    );
  }

  if (action === "add") {
    // Build all combinations to create
    const pairs: { articleId: string; tagId: string }[] = [];
    for (const articleId of articleIds as string[]) {
      for (const tagId of tagIds as string[]) {
        pairs.push({ articleId, tagId });
      }
    }

    // Use skipDuplicates to avoid conflicts with existing assignments
    const result = await prisma.articleTag.createMany({
      data: pairs,
      skipDuplicates: true,
    });

    return NextResponse.json({
      action: "add",
      created: result.count,
      totalPairs: pairs.length,
      skippedDuplicates: pairs.length - result.count,
    });
  } else {
    // Remove: delete all matching ArticleTag records
    const result = await prisma.articleTag.deleteMany({
      where: {
        articleId: { in: articleIds },
        tagId: { in: tagIds },
      },
    });

    return NextResponse.json({
      action: "remove",
      deleted: result.count,
    });
  }
}

export const dynamic = "force-dynamic";
