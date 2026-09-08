import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;

  const bounties = await prisma.knowledgeBounty.findMany({
    where: status ? { status } : {},
    include: {
      requester: { select: { username: true, displayName: true } },
      claimer: { select: { username: true, displayName: true } },
      article: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bounties);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description } = await request.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const bounty = await prisma.knowledgeBounty.create({
    data: { title, description, requesterId: user.id },
  });

  return NextResponse.json(bounty, { status: 201 });
}

export const dynamic = "force-dynamic";
