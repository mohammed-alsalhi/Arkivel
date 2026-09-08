import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/users/contributors
// Returns users who have created at least one published article.
// Used for search filter dropdowns. No authentication required.
export async function GET() {
  try {
    const contributors = await prisma.user.findMany({
      where: {
        articles: {
          some: { status: "published" },
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
      orderBy: { username: "asc" },
    });

    return NextResponse.json({ contributors });
  } catch (error) {
    console.error("Failed to fetch contributors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
