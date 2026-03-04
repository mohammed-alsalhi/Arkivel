import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";

// Zapier webhooks are stored in the Webhook table with a "zapier" event prefix
// or with a metadata convention. We use events array containing "zapier:<event>"
// to distinguish them from regular webhooks.
//
// Supported events:
//   article.created  article.updated  article.deleted
//   article.published  comment.created

const VALID_EVENTS = new Set([
  "article.created",
  "article.updated",
  "article.deleted",
  "article.published",
  "comment.created",
]);

const ZAPIER_EVENT_PREFIX = "zapier:";

function requireApiKey(request: NextRequest) {
  const apiKey = request.headers.get("X-API-Key");
  return apiKey;
}

// GET /api/webhooks/zapier — list all Zapier subscriptions for this API key
export async function GET(request: NextRequest) {
  const apiKeyUser = await validateApiKey(request);
  if (!apiKeyUser) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Include X-API-Key header." },
      { status: 401 }
    );
  }

  // Find webhooks owned by this API key's user that have a zapier-prefixed event
  const webhooks = await prisma.webhook.findMany({
    where: {
      events: { hasSome: [ZAPIER_EVENT_PREFIX + "article.created"] },
      // Filter to webhooks that have any zapier-prefixed event
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      events: true,
      active: true,
      createdAt: true,
    },
  });

  // Return only webhooks that have at least one zapier-prefixed event
  const zapierHooks = webhooks.filter((wh) =>
    wh.events.some((e) => e.startsWith(ZAPIER_EVENT_PREFIX))
  );

  const data = zapierHooks.map((wh) => ({
    id: wh.id,
    hookUrl: wh.url,
    events: wh.events
      .filter((e) => e.startsWith(ZAPIER_EVENT_PREFIX))
      .map((e) => e.slice(ZAPIER_EVENT_PREFIX.length)),
    active: wh.active,
    createdAt: wh.createdAt.toISOString(),
  }));

  return NextResponse.json({ data });
}

// POST /api/webhooks/zapier — subscribe to an event
// Body: { hookUrl: string, event: string }
export async function POST(request: NextRequest) {
  const apiKeyUser = await validateApiKey(request);
  if (!apiKeyUser) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Include X-API-Key header." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { hookUrl, event } = body as { hookUrl?: string; event?: string };

  if (!hookUrl || typeof hookUrl !== "string" || !hookUrl.startsWith("http")) {
    return NextResponse.json(
      { error: "hookUrl is required and must be a valid HTTP/HTTPS URL" },
      { status: 400 }
    );
  }

  if (!event || typeof event !== "string" || !VALID_EVENTS.has(event)) {
    return NextResponse.json(
      {
        error: `event must be one of: ${[...VALID_EVENTS].join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Check if this exact hookUrl+event pair already exists
  const existing = await prisma.webhook.findFirst({
    where: {
      url: hookUrl,
      events: { has: ZAPIER_EVENT_PREFIX + event },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Subscription already exists for this hookUrl and event" },
      { status: 409 }
    );
  }

  const webhook = await prisma.webhook.create({
    data: {
      url: hookUrl,
      events: [ZAPIER_EVENT_PREFIX + event],
      active: true,
    },
    select: {
      id: true,
      url: true,
      events: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      data: {
        id: webhook.id,
        hookUrl: webhook.url,
        event,
        active: webhook.active,
        createdAt: webhook.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}

// DELETE /api/webhooks/zapier — unsubscribe
// Body: { hookUrl: string }
export async function DELETE(request: NextRequest) {
  // Zapier DELETE requests may not always include body — also check query param
  const apiKeyHeader = requireApiKey(request);
  if (!apiKeyHeader) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Include X-API-Key header." },
      { status: 401 }
    );
  }

  // Validate api key properly
  const apiKeyUser = await validateApiKey(request);
  if (!apiKeyUser) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Include X-API-Key header." },
      { status: 401 }
    );
  }

  let hookUrl: string | undefined;

  // Try reading from body first
  try {
    const text = await request.text();
    if (text) {
      const parsed = JSON.parse(text) as { hookUrl?: string };
      hookUrl = parsed.hookUrl;
    }
  } catch {
    // ignore parse errors
  }

  // Fall back to query param
  if (!hookUrl) {
    hookUrl = request.nextUrl.searchParams.get("hookUrl") ?? undefined;
  }

  if (!hookUrl) {
    return NextResponse.json(
      { error: "hookUrl is required in the request body or as a query parameter" },
      { status: 400 }
    );
  }

  // Delete all Zapier webhooks matching this URL
  const { count } = await prisma.webhook.deleteMany({
    where: {
      url: hookUrl,
      // Only delete if it has at least one zapier-prefixed event
      events: {
        hasSome: [...VALID_EVENTS].map((e) => ZAPIER_EVENT_PREFIX + e),
      },
    },
  });

  if (count === 0) {
    return NextResponse.json(
      { error: "No Zapier subscriptions found for this hookUrl" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: { deleted: count } });
}

export const dynamic = "force-dynamic";
