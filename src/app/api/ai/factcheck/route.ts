import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const anthropic = createAnthropic();

type ClaimResult = {
  claim: string;
  verdict: "verified" | "plausible" | "uncertain" | "questionable";
  explanation: string;
  confidence: number; // 0–100
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { html } = await req.json();
  if (!html) return NextResponse.json({ error: "html required" }, { status: 400 });

  // Extract plain text, split into paragraphs
  const div = { innerHTML: html } as unknown as HTMLDivElement;
  // Server-side: parse HTML via regex to get text
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are a fact-checking assistant. Given an article excerpt, identify the 3-6 most significant factual claims (specific dates, numbers, names, events, scientific facts) and assess each one based on your knowledge.

For each claim, provide:
- claim: the exact claim text (under 100 chars)
- verdict: one of "verified" (clearly true), "plausible" (likely true but uncertain), "uncertain" (can't verify), "questionable" (may be inaccurate)
- explanation: 1-2 sentence reasoning (under 120 chars)
- confidence: integer 0-100

Respond with a JSON array only. No markdown, no preamble. Example:
[{"claim":"X happened in 1945","verdict":"verified","explanation":"Widely documented historical fact.","confidence":95}]`,
    prompt: `Article text:\n${plainText}`,
  });

  let results: ClaimResult[] = [];
  try {
    const clean = text.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
    results = JSON.parse(clean);
    // Sanitize
    results = results
      .filter((r) => r.claim && r.verdict && r.explanation)
      .map((r) => ({
        claim: String(r.claim).slice(0, 120),
        verdict: (["verified", "plausible", "uncertain", "questionable"].includes(r.verdict)
          ? r.verdict
          : "uncertain") as ClaimResult["verdict"],
        explanation: String(r.explanation).slice(0, 160),
        confidence: Math.max(0, Math.min(100, Number(r.confidence) || 50)),
      }));
  } catch {
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }

  // Suppress the unused variable warning
  void div;

  return NextResponse.json({ results });
}
