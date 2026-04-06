import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// In-memory presence map: articleId → Map<userId, { name, color, lastSeen }>
// Fine for single-instance deployments; for multi-instance use Redis
const presenceMap = new Map<string, Map<string, { name: string; color: string; lastSeen: number }>>();

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

type Params = { params: Promise<{ articleId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { articleId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!presenceMap.has(articleId)) {
    presenceMap.set(articleId, new Map());
  }
  const map = presenceMap.get(articleId)!;

  const existing = map.get(session.id);
  const color = existing?.color ?? COLORS[map.size % COLORS.length];
  const name = (session as { displayName?: string; username?: string }).displayName ||
               (session as { username?: string }).username || "Anonymous";

  map.set(session.id, { name, color, lastSeen: Date.now() });

  // Expire users not seen in 30 seconds
  const now = Date.now();
  for (const [id, user] of map.entries()) {
    if (now - user.lastSeen > 30000) map.delete(id);
  }

  const users = Array.from(map.entries()).map(([id, u]) => ({
    id,
    name: u.name,
    color: u.color,
    isMe: id === session.id,
  }));

  return NextResponse.json({ users });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { articleId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const map = presenceMap.get(articleId);
  if (map) map.delete(session.id);

  return NextResponse.json({ success: true });
}
