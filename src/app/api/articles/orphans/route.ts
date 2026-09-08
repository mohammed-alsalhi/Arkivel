import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await prisma.article.findMany({
    where: { published: true, status: "published" },
    select: { id: true, title: true, slug: true, content: true },
  });

  const orphans = articles.filter((article) => {
    const isLinkedTo = articles.some(
      (other) =>
        other.id !== article.id &&
        other.content.includes(`data-wiki-link="${article.title}"`)
    );
    return !isLinkedTo;
  });

  return NextResponse.json(
    orphans.map(({ id, title, slug }) => ({ id, title, slug }))
  );
}

export const dynamic = "force-dynamic";
