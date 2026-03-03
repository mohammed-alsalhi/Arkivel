import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      published: true,
      updatedAt: true,
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Check for a publishAt value stored in the article's metadata
  // Since there's no publishAt column in the schema, we store it via
  // a convention: status "scheduled" + we read from a MetricLog entry
  // that acts as a schedule record.
  const scheduleRecord = await prisma.metricLog.findFirst({
    where: {
      type: "article_schedule",
      path: article.id,
    },
    orderBy: { createdAt: "desc" },
  });

  const publishAt = scheduleRecord?.metadata
    ? (scheduleRecord.metadata as { publishAt?: string }).publishAt ?? null
    : null;

  return NextResponse.json({
    articleId: article.id,
    articleTitle: article.title,
    status: article.status,
    publishAt,
    scheduled: !!publishAt,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const { publishAt } = body;

  if (!publishAt) {
    return NextResponse.json(
      { error: "publishAt (ISO date string) is required" },
      { status: 400 }
    );
  }

  const scheduledDate = new Date(publishAt);
  if (isNaN(scheduledDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format. Use ISO 8601 (e.g. 2026-04-01T12:00:00Z)." },
      { status: 400 }
    );
  }

  if (scheduledDate <= new Date()) {
    return NextResponse.json(
      { error: "Scheduled date must be in the future." },
      { status: 400 }
    );
  }

  const article = await prisma.article.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Remove any existing schedule for this article
  await prisma.metricLog.deleteMany({
    where: { type: "article_schedule", path: id },
  });

  // Store schedule as a MetricLog entry
  await prisma.metricLog.create({
    data: {
      type: "article_schedule",
      path: id,
      duration: 0,
      metadata: { publishAt: scheduledDate.toISOString() },
    },
  });

  // Set article status to draft (will be published at scheduled time)
  await prisma.article.update({
    where: { id },
    data: { status: "draft", published: false },
  });

  return NextResponse.json({
    articleId: id,
    articleTitle: article.title,
    publishAt: scheduledDate.toISOString(),
    scheduled: true,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Remove any schedule entries
  const deleted = await prisma.metricLog.deleteMany({
    where: { type: "article_schedule", path: id },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: "No scheduled publication found for this article." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    articleId: id,
    articleTitle: article.title,
    scheduled: false,
    message: "Scheduled publication cancelled.",
  });
}
