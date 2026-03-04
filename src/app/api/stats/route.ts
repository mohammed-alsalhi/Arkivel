import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const [articles, categories, tags, users, revisions, discussions] = await Promise.all([
    prisma.article.count({ where: { published: true, status: "published" } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.articleRevision.count(),
    prisma.discussion.count(),
  ]);

  const recentEdits = await prisma.articleRevision.count({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });

  return NextResponse.json({
    articles,
    categories,
    tags,
    users,
    revisions,
    discussions,
    recentEditsThisWeek: recentEdits,
  });
}

export const dynamic = "force-dynamic";
