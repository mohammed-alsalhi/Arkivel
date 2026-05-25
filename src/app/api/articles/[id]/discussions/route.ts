import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin, requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { shouldRouteMentionNotification } from "@/lib/collaboration-controls";
import { normalizeDiscussionStatus, normalizeDiscussionVisibility } from "@/lib/moderation";
import { mergePreferences } from "@/lib/preferences";

async function createMentionNotifications(
  content: string,
  articleId: string,
  authorUsername: string
) {
  const mentionRegex = /@([\w-]+)/g;
  const mentioned = [...new Set([...content.matchAll(mentionRegex)].map((m) => m[1]))];
  if (mentioned.length === 0) return;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { wikiId: true },
  });

  const users = await prisma.user.findMany({
    where: { username: { in: mentioned } },
    select: {
      id: true,
      username: true,
      preferences: true,
      wikiMemberships: {
        where: article?.wikiId ? { wikiId: article.wikiId, status: "active" } : { id: "__legacy__" },
        select: { id: true },
      },
    },
  });

  await prisma.notification.createMany({
    data: users
      .filter((u) => {
        const saved =
          u.preferences && typeof u.preferences.data === "object" && u.preferences.data !== null
            ? (u.preferences.data as Record<string, unknown>)
            : {};
        const prefs = mergePreferences(saved);
        return shouldRouteMentionNotification({
          mentionedUserId: u.id,
          mentionedUserIsWorkspaceMember: article?.wikiId ? u.wikiMemberships.length > 0 : true,
          notifyOnMention: prefs.notifyOnMention,
        });
      })
      .map((u) => ({
        userId: u.id,
        articleId,
        type: "mention",
        message: `${authorUsername} mentioned you in a discussion comment`,
      })),
    skipDuplicates: true,
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  const publicWhere = admin ? {} : { status: "visible", visibility: "public" };
  const discussions = await prisma.discussion.findMany({
    where: { articleId: id, parentId: null, ...publicWhere },
    orderBy: { createdAt: "asc" },
    include: {
      replies: {
        where: publicWhere,
        orderBy: { createdAt: "asc" },
        include: {
          replies: {
            where: publicWhere,
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  return NextResponse.json(discussions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { author, content, parentId } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const trimmedAuthor = author?.trim() || "Anonymous";
  const trimmedContent = content.trim();

  const discussion = await prisma.discussion.create({
    data: {
      articleId: id,
      author: trimmedAuthor,
      content: trimmedContent,
      parentId: parentId ?? null,
    },
    include: {
      replies: true,
    },
  });

  await createMentionNotifications(trimmedContent, id, trimmedAuthor);

  return NextResponse.json(discussion, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: articleId } = await params;
  const body = await request.json().catch(() => ({}));
  const discussionId = typeof body.discussionId === "string" ? body.discussionId : null;
  if (!discussionId) {
    return NextResponse.json({ error: "discussionId is required" }, { status: 400 });
  }

  if (body.action === "report") {
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : null;
    await prisma.discussion.updateMany({
      where: { id: discussionId, articleId },
      data: {
        reportCount: { increment: 1 },
        reportReason: reason,
        reportedAt: new Date(),
        status: "reported",
      },
    });
    const updated = await prisma.discussion.findUnique({ where: { id: discussionId } });
    await logAudit("moderation.report", { type: "discussion", id: discussionId }, { reason }, { severity: "warning", request });
    return NextResponse.json(updated);
  }

  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const session = await getSession();
  const status = normalizeDiscussionStatus(body.status);
  const visibility = normalizeDiscussionVisibility(body.visibility);
  const moderationReason = typeof body.moderationReason === "string" ? body.moderationReason.trim().slice(0, 1000) : undefined;

  if (!status && !visibility && moderationReason === undefined) {
    return NextResponse.json({ error: "status, visibility, or moderationReason is required" }, { status: 400 });
  }

  await prisma.discussion.updateMany({
    where: { id: discussionId, articleId },
    data: {
      ...(status ? { status } : {}),
      ...(visibility ? { visibility } : {}),
      ...(moderationReason !== undefined ? { moderationReason } : {}),
      moderatedAt: new Date(),
      moderatedById: session?.id ?? null,
    },
  });
  const updated = await prisma.discussion.findUnique({ where: { id: discussionId } });
  await logAudit("moderation.discussion_update", { type: "discussion", id: discussionId }, {
    moderationReason,
    status,
    visibility,
  }, { request });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const discussionId = searchParams.get("discussionId");

  if (!discussionId) {
    return NextResponse.json({ error: "discussionId is required" }, { status: 400 });
  }

  await prisma.discussion.delete({ where: { id: discussionId } });
  await logAudit("discussion.delete", { type: "discussion", id: discussionId });
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
