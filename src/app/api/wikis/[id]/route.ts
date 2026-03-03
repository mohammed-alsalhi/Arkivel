import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Resolves whether the current session user is an admin of the given wiki.
 */
async function isWikiAdmin(wikiId: string, userId: string): Promise<boolean> {
  const membership = await prisma.wikiMembership.findUnique({
    where: { wikiId_userId: { wikiId, userId } },
    select: { role: true },
  });
  return membership?.role === "admin";
}

// GET /api/wikis/[id]
// Returns a single wiki with member count and article count.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const wiki = await prisma.wiki.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true },
        },
        _count: {
          select: { memberships: true, articles: true },
        },
      },
    });

    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    return NextResponse.json(wiki);
  } catch (error) {
    console.error("Failed to fetch wiki:", error);
    return NextResponse.json(
      { error: "Failed to fetch wiki" },
      { status: 500 }
    );
  }
}

// PUT /api/wikis/[id]
// Updates wiki metadata. Wiki admin only.
// Body: { name?, description?, settings? }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const wiki = await prisma.wiki.findUnique({ where: { id } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const adminAccess = await isWikiAdmin(id, session.id);
    if (!adminAccess) {
      return NextResponse.json(
        { error: "Wiki admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, settings } = body;

    const updated = await prisma.wiki.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(settings !== undefined && { settings }),
      },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true },
        },
        _count: {
          select: { memberships: true, articles: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update wiki:", error);
    return NextResponse.json(
      { error: "Failed to update wiki" },
      { status: 500 }
    );
  }
}

// DELETE /api/wikis/[id]
// Deletes a wiki. Owner only.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const wiki = await prisma.wiki.findUnique({ where: { id } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    if (wiki.ownerId !== session.id) {
      return NextResponse.json(
        { error: "Only the wiki owner can delete this wiki" },
        { status: 403 }
      );
    }

    await prisma.wiki.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete wiki:", error);
    return NextResponse.json(
      { error: "Failed to delete wiki" },
      { status: 500 }
    );
  }
}
