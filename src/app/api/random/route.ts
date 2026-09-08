import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");

  let categoryId: string | undefined;
  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
    if (cat) categoryId = cat.id;
  }

  const where = {
    status: "published",
    redirectTo: null as null,
    ...(categoryId ? { categoryId } : {}),
  };

  const count = await prisma.article.count({ where });
  if (count === 0) {
    return NextResponse.json({ error: "No articles found" }, { status: 404 });
  }

  const skip = Math.floor(Math.random() * count);
  const article = await prisma.article.findFirst({
    where,
    skip,
    select: { slug: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(new URL(`/articles/${article.slug}`, req.url));
}
