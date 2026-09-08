import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const translations = await prisma.articleTranslation.findMany({
    where: { articleId: id },
    orderBy: { locale: "asc" },
  });

  return NextResponse.json(translations);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const { locale, title, content, contentRaw, excerpt } = await request.json();

  if (!locale || !title || !content) {
    return NextResponse.json(
      { error: "locale, title, and content are required" },
      { status: 400 }
    );
  }

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Check for existing translation in this locale
  const existing = await prisma.articleTranslation.findUnique({
    where: { articleId_locale: { articleId: id, locale } },
  });

  if (existing) {
    return NextResponse.json(
      { error: `Translation for locale "${locale}" already exists. Use PUT to update.` },
      { status: 409 }
    );
  }

  const translation = await prisma.articleTranslation.create({
    data: {
      articleId: id,
      locale,
      title,
      content,
      contentRaw: contentRaw || null,
      excerpt: excerpt || null,
    },
  });

  return NextResponse.json(translation, { status: 201 });
}

export const dynamic = "force-dynamic";
