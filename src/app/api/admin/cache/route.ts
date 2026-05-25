import { NextRequest, NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import {
  cacheInvalidationRules,
  cacheRecipes,
  cacheStrategyContract,
  invalidateCacheForEvent,
  staleCacheWarning,
} from "@/lib/cache-strategy";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  return NextResponse.json({
    contract: cacheStrategyContract,
    generatedAt: new Date().toISOString(),
    redisConfigured: Boolean(process.env.REDIS_URL),
    recipes: cacheRecipes,
    rules: cacheInvalidationRules,
    staleWarnings: [
      staleCacheWarning("editor", null),
      staleCacheWarning("admin", null),
    ],
  });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const event = typeof body.event === "string" ? body.event : "";
  const result = await invalidateCacheForEvent(event);
  if (result.invalidatedKeys.length === 0) {
    return NextResponse.json({ error: "Unknown cache invalidation event" }, { status: 400 });
  }

  return NextResponse.json({
    ...result,
    invalidatedAt: new Date().toISOString(),
  });
}
