import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Fetch all published articles and filter by month/day in JS
  // (Prisma doesn't support extracting month/day without raw SQL portably)
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const matches = articles.filter((a) => {
    const d = new Date(a.createdAt);
    return d.getMonth() + 1 === month && d.getDate() === day;
  });

  return NextResponse.json(
    matches.map((a) => ({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      year: new Date(a.createdAt).getFullYear(),
    }))
  );
}
