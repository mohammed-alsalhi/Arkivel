import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { isAdmin, requireAdmin, getSession } from "@/lib/auth";
import { checkAndAwardAchievements } from "@/lib/achievements";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      mapMarkers: true,
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const { title, slug: newSlug, content, contentRaw, excerpt, coverImage, categoryId, tagIds, redirectTo, infobox, editSummary, status: articleStatus, isPinned, sortOrder } = body;

  // Snapshot current content as a revision before updating
  const current = await prisma.article.findUnique({
    where: { id },
    select: { title: true, content: true, contentRaw: true, infobox: true },
  });
  if (current) {
    // Get current user for revision attribution
    const session = await getSession();

    await prisma.articleRevision.create({
      data: {
        articleId: id,
        title: current.title,
        content: current.content,
        contentRaw: current.contentRaw,
        infobox: current.infobox || undefined,
        editSummary: editSummary || null,
        userId: session?.id || null,
      },
    });
  }

  // Delete existing tags and recreate
  if (tagIds !== undefined) {
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
  }

  // Handle slug change
  let slugUpdate: { slug: string } | Record<string, never> = {};
  if (newSlug !== undefined) {
    const slug = generateSlug(newSlug);
    if (slug) {
      const existing = await prisma.article.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "An article with that slug already exists" },
          { status: 409 }
        );
      }
      slugUpdate = { slug };
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...slugUpdate,
      ...(content !== undefined && { content }),
      ...(contentRaw !== undefined && { contentRaw }),
      ...(excerpt !== undefined && { excerpt }),
      ...(coverImage !== undefined && { coverImage }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(redirectTo !== undefined && { redirectTo: redirectTo || null }),
      ...(infobox !== undefined && { infobox: infobox || null }),
      ...(articleStatus !== undefined && { status: articleStatus }),
      ...(isPinned !== undefined && { isPinned }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(tagIds !== undefined && {
        tags: { create: tagIds.map((tagId: string) => ({ tagId })) },
      }),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  // Notify watchers (async, don't block response)
  notifyWatchers(id, article.title).catch(() => {});

  // Background: update AI summary and embedding (fire-and-forget)
  if (content !== undefined) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    Promise.all([
      fetch(`${baseUrl}/api/articles/${id}/summarize`, { method: "POST" }).catch(() => {}),
      fetch(`${baseUrl}/api/ai/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id }),
      }).catch(() => {}),
    ]).catch(() => {});
  }

  // Revalidate ISR cached pages
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/");
  if (article.category?.slug) {
    revalidatePath(`/categories/${article.category.slug}`);
  }

  // Fire-and-forget achievement check
  const session = await getSession();
  if (session?.id) checkAndAwardAchievements(session.id).catch(() => {});

  return NextResponse.json(article);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, select: { slug: true } });
  await prisma.article.delete({ where: { id } });
  if (article?.slug) revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/");
  return NextResponse.json({ success: true });
}

async function notifyWatchers(articleId: string, articleTitle: string) {
  // Get current editor to exclude from notifications
  const session = await getSession();
  const editorId = session?.id;

  // Find all watchers of this article (except the editor)
  const watchers = await prisma.watchlist.findMany({
    where: {
      articleId,
      ...(editorId ? { NOT: { userId: editorId } } : {}),
    },
    select: { userId: true },
  });

  if (watchers.length === 0) return;

  const editorName = session?.displayName || session?.username || "Someone";

  // Create notifications for all watchers
  await prisma.notification.createMany({
    data: watchers.map((w) => ({
      userId: w.userId,
      articleId,
      type: "edit",
      message: `${editorName} edited "${articleTitle}"`,
    })),
  });
}

export const dynamic = "force-dynamic";
