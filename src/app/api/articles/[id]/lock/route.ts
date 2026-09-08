import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function canEditArticleInWorkspace(articleId: string, userId: string, globalRole: string): Promise<boolean> {
  if (globalRole === "admin" || globalRole === "editor") {
    const article = await prisma.article.findUnique({ where: { id: articleId }, select: { wikiId: true } });
    if (!article?.wikiId) return true;
    const membership = await prisma.wikiMembership.findUnique({
      where: { wikiId_userId: { wikiId: article.wikiId, userId } },
      select: { role: true, status: true },
    });
    return membership?.status === "active" && ["admin", "editor"].includes(membership.role);
  }
  return false;
}

/** GET — return active lock for this article */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const lock = await prisma.articleLock.findUnique({
    where: { articleId: id },
    include: { user: { select: { username: true, displayName: true } } },
  });
  if (!lock || lock.expiresAt < new Date()) {
    // Clean up expired lock
    if (lock) await prisma.articleLock.delete({ where: { articleId: id } }).catch(() => {});
    return NextResponse.json({ lock: null });
  }
  return NextResponse.json({ lock });
}

/** POST — acquire or refresh lock */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canEditArticleInWorkspace(id, session.id, session.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert: create or update lock for this article
  const existing = await prisma.articleLock.findUnique({ where: { articleId: id } });
  if (existing && existing.userId !== session.id && existing.expiresAt > new Date()) {
    // Locked by someone else
    const holder = await prisma.user.findUnique({
      where: { id: existing.userId },
      select: { username: true, displayName: true },
    });
    return NextResponse.json({ error: "locked", holder }, { status: 409 });
  }

  const lock = await prisma.articleLock.upsert({
    where: { articleId: id },
    create: { articleId: id, userId: session.id, expiresAt },
    update: { userId: session.id, expiresAt },
  });

  return NextResponse.json({ lock });
}

/** DELETE — release lock (admin can force-release any lock) */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lock = await prisma.articleLock.findUnique({ where: { articleId: id } });
  if (!lock) return NextResponse.json({ ok: true });

  if (lock.userId !== session.id && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.articleLock.delete({ where: { articleId: id } });
  return NextResponse.json({ ok: true });
}
