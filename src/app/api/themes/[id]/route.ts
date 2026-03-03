import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

// GET /api/themes/[id]
// Returns a single theme by ID.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const theme = await prisma.themeConfig.findUnique({ where: { id } });
    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }
    return NextResponse.json(theme);
  } catch (error) {
    console.error("Failed to fetch theme:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

// PUT /api/themes/[id]
// Updates a theme. Must own the theme or be an admin.
// Body: { name?, variables?, isDefault? }
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
    const theme = await prisma.themeConfig.findUnique({ where: { id } });
    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    const admin = await isAdmin();
    const isOwner = theme.userId === session.id;
    if (!isOwner && !admin) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this theme" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, variables, isDefault } = body;

    // If setting as default, unset existing defaults for this user
    if (isDefault === true && theme.userId) {
      await prisma.themeConfig.updateMany({
        where: { userId: theme.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.themeConfig.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(variables !== undefined && { variables }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update theme:", error);
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    );
  }
}

// DELETE /api/themes/[id]
// Deletes a theme. Must own the theme or be an admin.
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
    const theme = await prisma.themeConfig.findUnique({ where: { id } });
    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    const admin = await isAdmin();
    const isOwner = theme.userId === session.id;
    if (!isOwner && !admin) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this theme" },
        { status: 403 }
      );
    }

    await prisma.themeConfig.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete theme:", error);
    return NextResponse.json(
      { error: "Failed to delete theme" },
      { status: 500 }
    );
  }
}
