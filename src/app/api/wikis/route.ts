import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/wikis
// Lists all public wikis plus the current user's own wikis (when authenticated).
export async function GET() {
  try {
    const session = await getSession();

    const where = session
      ? {
          OR: [
            { ownerId: session.id },
            {
              memberships: {
                some: { userId: session.id },
              },
            },
          ],
        }
      : {};

    const wikis = await prisma.wiki.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true },
        },
        _count: {
          select: { memberships: true, articles: true },
        },
      },
    });

    return NextResponse.json(wikis);
  } catch (error) {
    console.error("Failed to fetch wikis:", error);
    return NextResponse.json(
      { error: "Failed to fetch wikis" },
      { status: 500 }
    );
  }
}

// POST /api/wikis
// Creates a new wiki. Authentication required.
// Body: { slug, name, description? }
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
    const { slug, name, description } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { error: "slug and name are required" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Check uniqueness
    const existing = await prisma.wiki.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A wiki with this slug already exists" },
        { status: 409 }
      );
    }

    const wiki = await prisma.wiki.create({
      data: {
        slug,
        name,
        description: description || null,
        ownerId: session.id,
        // Automatically add the creator as an admin member
        memberships: {
          create: { userId: session.id, role: "admin" },
        },
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

    return NextResponse.json(wiki, { status: 201 });
  } catch (error) {
    console.error("Failed to create wiki:", error);
    return NextResponse.json(
      { error: "Failed to create wiki" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
