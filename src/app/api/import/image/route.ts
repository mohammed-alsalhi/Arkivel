import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a wiki editor. You have been given an image containing text, diagrams, or notes.
Your task:
1. Extract all readable text and information from the image.
2. Identify the main topic and structure the content as a wiki article.
3. Use <h2> for major sections, <h3> for subsections, <p> for paragraphs, <ul><li> for lists.
4. If the image contains handwriting, transcribe it faithfully.
5. If the image is a diagram or chart, describe it in words and extract key data.
6. Do NOT include a <h1> — the title is set separately.
7. Output pure HTML only. No markdown. No preamble. No explanation.
Infer a short article title from the content and return it as the very first line like: TITLE: <title>
Then a blank line, then the HTML body.`;

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY required" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image file provided" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported format. Use JPEG, PNG, GIF, or WebP." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const anthropic = createAnthropic({ apiKey: anthropicKey });

  const { text: rawText } = await generateText({
    model: anthropic("claude-opus-4-5"),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: `data:${file.type};base64,${base64}`,
          },
          {
            type: "text",
            text: "Please extract and format the content of this image as a wiki article.",
          },
        ],
      },
    ],
  });

  // Extract title from first line
  const lines = rawText.trim().split("\n");
  let title = "Imported from Image";
  let html = rawText;

  if (lines[0].startsWith("TITLE:")) {
    title = lines[0].replace("TITLE:", "").trim();
    html = lines.slice(1).join("\n").trim();
  }

  // Strip accidental markdown fences
  html = html.replace(/^```html?\n?/i, "").replace(/\n?```$/, "").trim();

  return NextResponse.json({ title, html });
}
