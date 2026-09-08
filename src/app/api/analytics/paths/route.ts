import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { fromSlug, toSlug, sessionId } = await request.json();
  if (!fromSlug || !toSlug || !sessionId) {
    return NextResponse.json({ error: "fromSlug, toSlug, sessionId required" }, { status: 400 });
  }

  await prisma.readerPathEvent.create({ data: { fromSlug, toSlug, sessionId } });
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fromSlug = url.searchParams.get("fromSlug");
  if (!fromSlug) return NextResponse.json({ error: "fromSlug required" }, { status: 400 });

  const events = await prisma.readerPathEvent.groupBy({
    by: ["toSlug"],
    where: { fromSlug },
    _count: { toSlug: true },
    orderBy: { _count: { toSlug: "desc" } },
    take: 10,
  });

  return NextResponse.json(
    events.map((e) => ({ toSlug: e.toSlug, count: e._count.toSlug }))
  );
}

export const dynamic = "force-dynamic";
