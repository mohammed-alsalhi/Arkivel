import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const dynamic = "force-dynamic";

function getProvider() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  return createAnthropic({ apiKey });
}

/**
 * POST /api/ai/alt-text
 * Body: { filename: string; caption?: string }
 * Returns: { altText: string }
 *
 * Generates a descriptive alt-text suggestion from the image filename and optional caption.
 * When AI is not configured, derives alt text heuristically from the filename.
 */
export async function POST(request: NextRequest) {
  const { filename, caption } = await request.json();
  if (!filename?.trim()) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }

  // Heuristic: clean up the filename into a readable description
  const baseName = (filename as string)
    .replace(/\.[^.]+$/, "")          // strip extension
    .replace(/[-_]/g, " ")            // dashes/underscores → spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → words
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const provider = getProvider();
  if (!provider) {
    const alt = caption?.trim() || capitalise(baseName);
    return NextResponse.json({ altText: alt, source: "heuristic" });
  }

  const captionLine = caption?.trim() ? `\nImage caption: "${caption.trim()}"` : "";

  try {
    const { text } = await generateText({
      model: provider("claude-haiku-4-5-20251001"),
      messages: [
        {
          role: "user",
          content: `Write a short, descriptive alt-text for an image based only on the information below. The alt text should be 5-15 words, factual, and not start with "image of" or "photo of".

Filename: ${baseName}${captionLine}

Reply with ONLY the alt text, no quotes or explanation.`,
        },
      ],
      maxOutputTokens: 60,
    });

    const altText = text.trim().replace(/^["']|["']$/g, "");
    return NextResponse.json({ altText: altText || capitalise(baseName), source: "ai" });
  } catch {
    return NextResponse.json({ altText: capitalise(baseName), source: "heuristic" });
  }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
