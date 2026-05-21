import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import * as Y from "yjs";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ articleId: string }> };

/** GET — returns base64-encoded Yjs doc state (or seed from article HTML if none) */
export async function GET(_request: NextRequest, { params }: Params) {
  const { articleId } = await params;

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session_ = await prisma.collaborationSession.findUnique({ where: { articleId } });

  if (!session_) {
    // Seed from article content
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { content: true },
    });
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const ydoc = new Y.Doc();
    // Empty doc — client will initialise it with the article content on first sync
    const state = Buffer.from(Y.encodeStateAsUpdate(ydoc));

    await prisma.collaborationSession.create({
      data: { articleId, ydoc: state },
    });

    return NextResponse.json({
      state: state.toString("base64"),
      updatedAt: new Date().toISOString(),
      users: [],
    });
  }

  return NextResponse.json({
    state: Buffer.from(session_.ydoc).toString("base64"),
    updatedAt: session_.updatedAt.toISOString(),
    users: [],
  });
}

/** POST — applies a Yjs update and returns the new merged state */
export async function POST(request: NextRequest, { params }: Params) {
  const { articleId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { update } = body; // base64 Yjs update

  if (!update) return NextResponse.json({ error: "update required" }, { status: 400 });

  const updateBytes = Buffer.from(update, "base64");

  // Load existing doc or create new one
  const existing = await prisma.collaborationSession.findUnique({ where: { articleId } });

  const ydoc = new Y.Doc();
  if (existing?.ydoc) {
    Y.applyUpdate(ydoc, existing.ydoc);
  }

  // Apply the incoming update
  Y.applyUpdate(ydoc, updateBytes);

  const newState = Buffer.from(Y.encodeStateAsUpdate(ydoc));

  await prisma.collaborationSession.upsert({
    where: { articleId },
    create: { articleId, ydoc: newState },
    update: { ydoc: newState },
  });

  return NextResponse.json({
    state: newState.toString("base64"),
    updatedAt: new Date().toISOString(),
  });
}

/** DELETE — clears the collaboration session (admin only) */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { articleId } = await params;
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.collaborationSession.deleteMany({ where: { articleId } });
  return NextResponse.json({ success: true });
}
