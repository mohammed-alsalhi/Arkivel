import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await validateApiKey(request);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Include X-API-Key header." },
      { status: 401 }
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      name: true,
      slug: true,
      description: true,
      icon: true,
      sortOrder: true,
      parent: { select: { name: true, slug: true } },
      _count: { select: { articles: true, children: true } },
    },
  });

  const formatted = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    sortOrder: c.sortOrder,
    parent: c.parent ? { name: c.parent.name, slug: c.parent.slug } : null,
    articleCount: c._count.articles,
    childCount: c._count.children,
  }));

  return NextResponse.json({ categories: formatted });
}
