import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type PeerResult = {
  peerName: string;
  peerUrl: string;
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  url: string;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const peers = await prisma.federatedPeer.findMany({ where: { enabled: true } });
  if (peers.length === 0) return NextResponse.json([]);

  const results = await Promise.allSettled(
    peers.map(async (peer) => {
      const url = `${peer.baseUrl}/api/v1/articles?q=${encodeURIComponent(q)}&limit=5`;
      const headers: Record<string, string> = {};
      if (peer.apiKey) headers["X-API-Key"] = peer.apiKey;

      const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
      if (!res.ok) return [];

      const data = await res.json();
      const articles = Array.isArray(data) ? data : (data.articles ?? []);

      return articles.slice(0, 5).map((a: { id: string; title: string; slug: string; excerpt?: string }) => ({
        peerName: peer.name,
        peerUrl: peer.baseUrl,
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? null,
        url: `${peer.baseUrl}/articles/${a.slug}`,
      }));
    })
  );

  const merged: PeerResult[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") merged.push(...r.value);
  }

  return NextResponse.json(merged);
}

export const dynamic = "force-dynamic";
