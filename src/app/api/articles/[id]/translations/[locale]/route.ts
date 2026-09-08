import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; locale: string }> }
) {
  const { id, locale } = await params;

  const translation = await prisma.articleTranslation.findUnique({
    where: { articleId_locale: { articleId: id, locale } },
  });

  if (!translation) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  return NextResponse.json(translation);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locale: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id, locale } = await params;
  const { title, content, contentRaw, excerpt } = await request.json();

  const existing = await prisma.articleTranslation.findUnique({
    where: { articleId_locale: { articleId: id, locale } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  const translation = await prisma.articleTranslation.update({
    where: { articleId_locale: { articleId: id, locale } },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(contentRaw !== undefined && { contentRaw: contentRaw || null }),
      ...(excerpt !== undefined && { excerpt: excerpt || null }),
    },
  });

  return NextResponse.json(translation);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; locale: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id, locale } = await params;

  const existing = await prisma.articleTranslation.findUnique({
    where: { articleId_locale: { articleId: id, locale } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Translation not found" }, { status: 404 });
  }

  await prisma.articleTranslation.delete({
    where: { articleId_locale: { articleId: id, locale } },
  });

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
