import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";

// GET /api/webhooks/zapier/poll
//
// Polling trigger endpoint for Zapier.
// Zapier's polling triggers periodically call this endpoint and look for new items.
// The response MUST be an array of objects (Zapier requirement).
//
// By default returns articles created in the last 15 minutes.
// Zapier de-duplicates by the `id` field, so we always return the same shape.
//
// Optional query params:
//   ?minutes=N   look back N minutes (default 15, max 1440)
//   ?limit=N     max results (default 20, max 100)

export async function GET(request: NextRequest) {
  const apiKeyUser = await validateApiKey(request);
  if (!apiKeyUser) {
    return NextResponse.json(
      [{ error: "Invalid or missing API key. Include X-API-Key header." }],
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const minutesParam = parseInt(searchParams.get("minutes") || "15");
  const lookbackMinutes = Math.min(1440, Math.max(1, isNaN(minutesParam) ? 15 : minutesParam));

  const limitParam = parseInt(searchParams.get("limit") || "20");
  const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 20 : limitParam));

  const since = new Date(Date.now() - lookbackMinutes * 60 * 1000);

  // Fetch recently created published articles
  const articles = await prisma.article.findMany({
    where: {
      status: "published",
      createdAt: { gte: since },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });

  // Zapier requires an array response
  // Include a sample item when the array is empty so Zapier can map fields during setup
  if (articles.length === 0) {
    return NextResponse.json([
      {
        id: "sample-id",
        title: "Sample Article Title",
        slug: "sample-article-title",
        excerpt: "This is a sample article excerpt for Zapier field mapping.",
        status: "published",
        url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/wiki/sample-article-title`,
        category: null,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const data = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    status: a.status,
    url: `${baseUrl}/wiki/${a.slug}`,
    category: a.category
      ? { id: a.category.id, name: a.category.name, slug: a.category.slug }
      : null,
    tags: a.tags.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      slug: t.tag.slug,
    })),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
