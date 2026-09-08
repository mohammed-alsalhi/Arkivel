import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const articles = await prisma.article.findMany({
    where: { status: "published", redirectTo: null },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true } },
      _count: {
        select: {
          revisions: true,
        },
      },
    },
    orderBy: { title: "asc" },
  });

  const readCounts = await prisma.articleRead.groupBy({
    by: ["articleId"],
    _count: { articleId: true },
  });

  const reactionCounts = await prisma.articleReaction.groupBy({
    by: ["articleId"],
    _count: { articleId: true },
  });

  const readMap = new Map(readCounts.map((r) => [r.articleId, r._count.articleId]));
  const reactionMap = new Map(reactionCounts.map((r) => [r.articleId, r._count.articleId]));

  const rows = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    category: a.category?.name ?? "",
    created: a.createdAt.toISOString().slice(0, 10),
    updated: a.updatedAt.toISOString().slice(0, 10),
    reads: readMap.get(a.id) ?? 0,
    reactions: reactionMap.get(a.id) ?? 0,
    revisions: a._count.revisions,
  }));

  const headers = ["ID", "Title", "Slug", "Category", "Created", "Updated", "Reads", "Reactions", "Revisions"];
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [r.id, r.title, r.slug, r.category, r.created, r.updated, r.reads, r.reactions, r.revisions]
        .map(escape)
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
