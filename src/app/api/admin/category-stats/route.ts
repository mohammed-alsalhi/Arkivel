import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      articles: {
        where: { status: "published" },
        select: { content: true, updatedAt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const rows = categories.map((cat) => {
    const wordCounts = cat.articles.map((a) =>
      a.content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    );
    const totalWords = wordCounts.reduce((s, n) => s + n, 0);
    const avgWords = wordCounts.length > 0 ? Math.round(totalWords / wordCounts.length) : 0;
    const lastEdit =
      cat.articles.length > 0
        ? new Date(Math.max(...cat.articles.map((a) => a.updatedAt.getTime())))
        : null;

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      articleCount: cat.articles.length,
      totalWords,
      avgWords,
      lastEdit: lastEdit?.toISOString() ?? null,
    };
  });

  return NextResponse.json(rows);
}
