import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Checks whether the session user is a wiki admin.
 */
async function isWikiAdmin(wikiId: string, userId: string): Promise<boolean> {
  const membership = await prisma.wikiMembership.findUnique({
    where: { wikiId_userId: { wikiId, userId } },
    select: { role: true },
  });
  return membership?.role === "admin";
}

// GET /api/wikis/[id]/members
// Lists all members of a wiki.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: wikiId } = await params;

  try {
    const wiki = await prisma.wiki.findUnique({ where: { id: wikiId } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const members = await prisma.wikiMembership.findMany({
      where: { wikiId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch wiki members:", error);
    return NextResponse.json(
      { error: "Failed to fetch wiki members" },
      { status: 500 }
    );
  }
}

// POST /api/wikis/[id]/members
// Adds a member to the wiki. Wiki admin only.
// Body: { userId, role }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: wikiId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const wiki = await prisma.wiki.findUnique({ where: { id: wikiId } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const adminAccess = await isWikiAdmin(wikiId, session.id);
    if (!adminAccess) {
      return NextResponse.json(
        { error: "Wiki admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "editor", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "role must be 'admin', 'editor', or 'viewer'" },
        { status: 400 }
      );
    }

    // Verify user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = await prisma.wikiMembership.upsert({
      where: { wikiId_userId: { wikiId, userId } },
      create: { wikiId, userId, role },
      update: { role },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error("Failed to add wiki member:", error);
    return NextResponse.json(
      { error: "Failed to add wiki member" },
      { status: 500 }
    );
  }
}

// DELETE /api/wikis/[id]/members
// Removes a member from the wiki. Wiki admin only.
// Body: { userId }
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: wikiId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const wiki = await prisma.wiki.findUnique({ where: { id: wikiId } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const adminAccess = await isWikiAdmin(wikiId, session.id);
    if (!adminAccess) {
      return NextResponse.json(
        { error: "Wiki admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Prevent removing the owner
    if (wiki.ownerId === userId) {
      return NextResponse.json(
        { error: "Cannot remove the wiki owner" },
        { status: 400 }
      );
    }

    await prisma.wikiMembership.delete({
      where: { wikiId_userId: { wikiId, userId } },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to remove wiki member:", error);
    return NextResponse.json(
      { error: "Failed to remove wiki member" },
      { status: 500 }
    );
  }
}
