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

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      color: true,
      parent: { select: { name: true, slug: true } },
      _count: { select: { articles: true, children: true } },
    },
  });

  const formatted = tags.map((t) => ({
    name: t.name,
    slug: t.slug,
    color: t.color,
    parent: t.parent ? { name: t.parent.name, slug: t.parent.slug } : null,
    articleCount: t._count.articles,
    childCount: t._count.children,
  }));

  return NextResponse.json({ tags: formatted });
}
