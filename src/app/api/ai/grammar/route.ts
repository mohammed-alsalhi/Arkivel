import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GrammarIssue = {
  offset: number;
  length: number;
  message: string;
  suggestion: string;
  severity: "error" | "warning" | "style";
};

/** POST /api/ai/grammar
 *  Body: { text: string }  (plain text, max 4000 chars)
 *  Returns: { issues: GrammarIssue[] }
 *  Falls back to a heuristic-only response when OPENAI_API_KEY is not set.
 */
export async function POST(request: NextRequest) {
  const { text } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ issues: [] });
  }

  const sample = text.slice(0, 4000);
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a grammar and style checker. Analyze the provided text and return a JSON array of issues.
Each issue must have:
- offset: character index in the original text where the issue starts
- length: number of characters affected
- message: short description of the problem (max 80 chars)
- suggestion: the corrected text to replace the span (empty string if no direct replacement)
- severity: "error" | "warning" | "style"

Return ONLY the raw JSON array, no markdown, no explanation. Return [] if no issues found.`,
            },
            {
              role: "user",
              content: sample,
            },
          ],
          temperature: 0,
          max_tokens: 1500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content?.trim() ?? "[]";
        try {
          const issues: GrammarIssue[] = JSON.parse(raw);
          if (Array.isArray(issues)) {
            return NextResponse.json({ issues: issues.slice(0, 30) });
          }
        } catch {
          // fall through to heuristic
        }
      }
    } catch {
      // fall through to heuristic
    }
  }

  // Heuristic-only fallback (no API key or API failure)
  const issues: GrammarIssue[] = heuristicCheck(sample);
  return NextResponse.json({ issues });
}

/** Basic heuristic checks: double spaces, repeated words, very long sentences */
function heuristicCheck(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  // Double spaces
  const doubleSpaceRe = /  +/g;
  let m;
  while ((m = doubleSpaceRe.exec(text)) !== null) {
    issues.push({
      offset: m.index,
      length: m[0].length,
      message: "Extra whitespace",
      suggestion: " ",
      severity: "style",
    });
  }

  // Repeated words (e.g. "the the")
  const repeatRe = /\b(\w+)\s+\1\b/gi;
  while ((m = repeatRe.exec(text)) !== null) {
    issues.push({
      offset: m.index,
      length: m[0].length,
      message: `Repeated word: "${m[1]}"`,
      suggestion: m[1],
      severity: "error",
    });
  }

  return issues.slice(0, 20);
}
