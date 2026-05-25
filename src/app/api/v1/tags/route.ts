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

  return NextResponse.json({ tags: formatted }, { headers: apiV1Headers });
}

export const dynamic = "force-dynamic";
