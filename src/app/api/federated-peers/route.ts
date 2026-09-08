import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const peers = await prisma.federatedPeer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(peers);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, baseUrl, apiKey, enabled } = await request.json();
  if (!name?.trim() || !baseUrl?.trim()) {
    return NextResponse.json({ error: "name and baseUrl required" }, { status: 400 });
  }
  const peer = await prisma.federatedPeer.create({
    data: {
      name: name.trim(),
      baseUrl: baseUrl.trim().replace(/\/$/, ""),
      apiKey: apiKey?.trim() || null,
      enabled: enabled !== false,
    },
  });
  return NextResponse.json(peer, { status: 201 });
}

export const dynamic = "force-dynamic";
