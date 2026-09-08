import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";

function verifySlackSignature(
  signingSecret: string,
  body: string,
  timestamp: string,
  signature: string
): boolean {
  const baseString = `v0:${timestamp}:${body}`;
  const hmac = createHmac("sha256", signingSecret).update(baseString).digest("hex");
  return `v0=${hmac}` === signature;
}

export async function POST(request: Request) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return NextResponse.json({ error: "Slack not configured" }, { status: 501 });

  const rawBody = await request.text();
  const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";
  const signature = request.headers.get("x-slack-signature") ?? "";

  if (!verifySlackSignature(secret, rawBody, timestamp, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const text = (params.get("text") ?? "").trim();
  const responseUrl = params.get("response_url");

  if (!text) {
    return NextResponse.json({ text: "Usage: `/wiki <search query>`" });
  }

  const words = text.toLowerCase().split(/\s+/);
  const articles = await prisma.article.findMany({
    where: {
      status: "published",
      AND: words.map((w) => ({
        OR: [
          { title: { contains: w, mode: "insensitive" } },
          { content: { contains: w, mode: "insensitive" } },
        ],
      })),
    },
    select: { title: true, slug: true, excerpt: true },
    take: 5,
    orderBy: { updatedAt: "desc" },
  });

  if (articles.length === 0) {
    return NextResponse.json({ text: `No results found for "${text}".` });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://wiki.example.com";
  const blocks = [
    { type: "section", text: { type: "mrkdwn", text: `*Search results for "${text}":*` } },
    ...articles.map((a) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${baseUrl}/articles/${a.slug}|${a.title}>*\n${a.excerpt ?? ""}`,
      },
    })),
  ];

  const payload = { blocks, response_type: "ephemeral" };

  if (responseUrl) {
    // Respond async via response_url for better Slack UX
    fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
    return NextResponse.json({ response_type: "ephemeral", text: "Searching…" });
  }

  return NextResponse.json(payload);
}

export const dynamic = "force-dynamic";
