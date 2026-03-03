import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { getSession, isAdmin } from "@/lib/auth";

const ALLOWED_FIELDS = new Set([
  "id",
  "title",
  "slug",
  "excerpt",
  "content",
  "contentRaw",
  "status",
  "published",
  "coverImage",
  "infobox",
  "isPinned",
  "sortOrder",
  "createdAt",
  "updatedAt",
  "category",
  "tags",
  "revisions",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth: accept API key OR session
  const apiKeyUser = await validateApiKey(request);
  const session = apiKeyUser ? null : await getSession();
  const admin = apiKeyUser ? false : await isAdmin();
  const isAdminAccess = admin || !!apiKeyUser;

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const fieldsParam = searchParams.get("fields");

  // Determine requested fields
  const requestedFields = fieldsParam
    ? new Set(fieldsParam.split(",").map((f) => f.trim()).filter((f) => ALLOWED_FIELDS.has(f)))
    : ALLOWED_FIELDS;

  // Build select
  const select: Record<string, unknown> = {
    id: true,
    slug: true,
  };

  for (const field of requestedFields) {
    if (field === "category") {
      select.category = { select: { id: true, name: true, slug: true, icon: true, description: true } };
    } else if (field === "tags") {
      select.tags = {
        select: { tag: { select: { id: true, name: true, slug: true, color: true } } },
      };
    } else if (field === "revisions") {
      // Only include revision count (not full content) for performance
      select._count = { select: { revisions: true } };
    } else if (ALLOWED_FIELDS.has(field)) {
      select[field] = true;
    }
  }

  // Look up by id first, then slug
  const isSlug = !id.match(/^c[a-z0-9]{20,}$/);
  const whereClause = isSlug ? { slug: id } : { id };

  const article = await prisma.article.findFirst({
    where: whereClause,
    select,
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Enforce visibility: non-admins cannot see non-published articles
  if (!isAdminAccess) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (article as any).status;
    if (status && status !== "published") {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const published = (article as any).published;
    if (published === false) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
  }

  // Flatten tags from ArticleTag join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatted: Record<string, any> = { ...article };
  if (Array.isArray(formatted.tags)) {
    formatted.tags = formatted.tags.map((t: { tag: unknown }) => t.tag);
  }

  // Reshape revision count
  if (formatted._count) {
    formatted.revisionCount = formatted._count.revisions ?? 0;
    delete formatted._count;
  }

  return NextResponse.json({ data: formatted });
}
