import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { apiV1Headers, createApiV1Error } from "@/lib/public-api-v1";

export async function GET(request: NextRequest) {
  const user = await validateApiKey(request);
  if (!user) {
    const error = createApiV1Error("Invalid or missing API key. Include X-API-Key header.", 401, "api_key_required");
    return NextResponse.json(error.body, { status: error.status, headers: error.headers });
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      parent: { select: { name: true, slug: true } },
      _count: { select: { articles: true, children: true } },
    },
  });

  const formatted = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    parent: c.parent ? { name: c.parent.name, slug: c.parent.slug } : null,
    articleCount: c._count.articles,
    childCount: c._count.children,
  }));

  return NextResponse.json({ categories: formatted }, { headers: apiV1Headers });
}

export const dynamic = "force-dynamic";
