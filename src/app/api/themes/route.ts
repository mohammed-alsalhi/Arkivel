import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/themes
// Returns all global themes (no userId) plus the current user's own themes.
// No authentication required for reading global themes.
export async function GET() {
  try {
    const session = await getSession();

    const where = session
      ? { OR: [{ userId: null }, { userId: session.id }] }
      : { userId: null };

    const themes = await prisma.themeConfig.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        variables: true,
        isDefault: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(themes);
  } catch (error) {
    console.error("Failed to fetch themes:", error);
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

// POST /api/themes
// Creates or saves a new theme. Authentication required.
// Body: { name, variables, isDefault? }
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, variables, isDefault = false } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }
    if (!variables || typeof variables !== "object") {
      return NextResponse.json(
        { error: "variables is required and must be an object" },
        { status: 400 }
      );
    }

    // If setting as default, unset any existing default for this user
    if (isDefault) {
      await prisma.themeConfig.updateMany({
        where: { userId: session.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const theme = await prisma.themeConfig.create({
      data: {
        name,
        variables,
        isDefault,
        userId: session.id,
      },
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error("Failed to create theme:", error);
    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 }
    );
  }
}
