import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const dynamic = "force-dynamic";

/** Extract YouTube video ID from various URL formats */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Fetch YouTube transcript via the unofficial timedtext API */
async function fetchTranscript(videoId: string): Promise<{ text: string; title: string } | null> {
  try {
    // First fetch the video page to get title and check for captions
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WikiBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!pageRes.ok) return null;
    const pageHtml = await pageRes.text();

    // Extract title
    const titleMatch = pageHtml.match(/<title>([^<]+)<\/title>/);
    const rawTitle = titleMatch?.[1]?.replace(" - YouTube", "").trim() ?? "YouTube Video";

    // Find caption track URL
    const captionMatch = pageHtml.match(/"captionTracks":\s*\[.*?"baseUrl":"([^"]+)"/);
    if (!captionMatch) return null;

    const captionUrl = captionMatch[1].replace(/\\u0026/g, "&");
    const captionRes = await fetch(captionUrl, { signal: AbortSignal.timeout(10000) });
    if (!captionRes.ok) return null;

    const captionXml = await captionRes.text();

    // Parse <text> elements from caption XML
    const textParts: string[] = [];
    const textRegex = /<text[^>]*>([^<]*)<\/text>/g;
    let m: RegExpExecArray | null;
    while ((m = textRegex.exec(captionXml)) !== null) {
      const decoded = m[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#\d+;/g, "")
        .trim();
      if (decoded) textParts.push(decoded);
    }

    if (textParts.length === 0) return null;

    const text = textParts.join(" ").replace(/\s+/g, " ").trim();
    return { text, title: rawTitle };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY required" }, { status: 503 });
  }

  const { url } = await request.json();
  const videoId = extractVideoId(url ?? "");

  if (!videoId) {
    return NextResponse.json({ error: "Could not find a YouTube video ID in that URL" }, { status: 400 });
  }

  const transcript = await fetchTranscript(videoId);
  if (!transcript) {
    return NextResponse.json({
      error: "Could not retrieve a transcript for this video. The video may have no captions, or captions may be disabled.",
    }, { status: 422 });
  }

  // Truncate transcript to fit context
  const truncated = transcript.text.slice(0, 15000);

  const anthropic = createAnthropic({ apiKey: anthropicKey });
  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are a wiki editor. You have been given the transcript of a YouTube video.
Your task: produce a well-structured, encyclopaedic wiki article summarising the key information.
- Use <h2> for major sections, <h3> for subsections, <p> for paragraphs, <ul><li> for key points.
- Do NOT include a <h1> — title is set separately.
- Organise ideas logically — do not follow the transcript order if a better structure exists.
- Remove filler words, repetition, and conversational asides.
- Output pure HTML only. No markdown. No preamble.`,
    prompt: `Video title: ${transcript.title}
Video ID: ${videoId}
Source URL: https://youtube.com/watch?v=${videoId}

Transcript:
${truncated}`,
  });

  const html = text.replace(/^```html?\n?/i, "").replace(/\n?```$/, "").trim();

  return NextResponse.json({
    title: transcript.title,
    html,
    videoId,
    sourceUrl: `https://youtube.com/watch?v=${videoId}`,
  });
}
