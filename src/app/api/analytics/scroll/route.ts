import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { articleId, depth, sessionId } = await request.json();
  if (!articleId || depth === undefined || !sessionId) {
    return NextResponse.json({ error: "articleId, depth, sessionId required" }, { status: 400 });
  }

  // Upsert: keep the maximum depth seen for this session
  const existing = await prisma.scrollDepthLog.findFirst({
    where: { articleId, sessionId },
  });

  if (!existing) {
    await prisma.scrollDepthLog.create({
      data: { articleId, sessionId, depth: Math.min(100, Math.max(0, depth)) },
    });
  } else if (depth > existing.depth) {
    await prisma.scrollDepthLog.update({
      where: { id: existing.id },
      data: { depth: Math.min(100, depth) },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const articleId = url.searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const logs = await prisma.scrollDepthLog.findMany({ where: { articleId } });
  const total = logs.length;
  if (total === 0) return NextResponse.json({ articleId, avgDepth: 0, buckets: [] });

  // Group into 10% buckets
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    from: i * 10,
    to: (i + 1) * 10,
    count: logs.filter((l) => l.depth >= i * 10 && l.depth < (i + 1) * 10).length,
  }));

  const avgDepth = Math.round(logs.reduce((s, l) => s + l.depth, 0) / total);

  return NextResponse.json({ articleId, avgDepth, total, buckets });
}

export const dynamic = "force-dynamic";
