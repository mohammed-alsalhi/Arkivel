import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const anthropic = createAnthropic();

const TEMPLATES: Record<string, string> = {
  person: `You are writing a Wikipedia-style encyclopedia article about a person.
Generate a comprehensive article with these sections:
- Opening paragraph (2-3 sentences summarizing who they are)
- Early life / Background
- Career / Work
- Notable achievements
- Legacy / Impact

Format as clean HTML using <h2> for section headings and <p> for paragraphs.`,

  event: `You are writing a Wikipedia-style encyclopedia article about a historical event.
Generate a comprehensive article with these sections:
- Opening paragraph (2-3 sentences summarizing the event)
- Background / Context
- The event itself
- Consequences / Aftermath
- Historical significance

Format as clean HTML using <h2> for section headings and <p> for paragraphs.`,

  place: `You are writing a Wikipedia-style encyclopedia article about a place, location, or region.
Generate a comprehensive article with these sections:
- Opening paragraph (2-3 sentences describing the place)
- Geography / Location
- History
- Culture / People
- Points of interest / Notable features

Format as clean HTML using <h2> for section headings and <p> for paragraphs.`,

  concept: `You are writing a Wikipedia-style encyclopedia article about a concept, idea, or theory.
Generate a comprehensive article with these sections:
- Opening paragraph (2-3 sentences defining the concept)
- Definition / Explanation
- Origins / History
- Key aspects / Components
- Applications / Examples
- Criticism / Limitations

Format as clean HTML using <h2> for section headings and <p> for paragraphs.`,

  organization: `You are writing a Wikipedia-style encyclopedia article about an organization, company, or institution.
Generate a comprehensive article with these sections:
- Opening paragraph (2-3 sentences describing the organization)
- History / Founding
- Structure / Leadership
- Activities / Products
- Impact / Significance

Format as clean HTML using <h2> for section headings and <p> for paragraphs.`,

  product: `You are writing a Wikipedia-style encyclopedia article about a product, technology, or invention.
Generate a comprehensive article with these sections:
- Opening paragraph (2-3 sentences describing the product)
- Background / Development
- Features / Specifications
- Reception / Impact
- Legacy / Current status

Format as clean HTML using <h2> for section headings and <p> for paragraphs.`,
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, template } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const systemPrompt = TEMPLATES[template] ?? TEMPLATES.concept;

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    prompt: `Write a comprehensive encyclopedia article about: "${title}"

Write with confidence about real, well-known topics. For fictional or lesser-known topics, note the nature of the subject. Keep the tone encyclopedic and neutral. Output ONLY the HTML content — no markdown fences, no preamble.`,
  });

  // Strip markdown fences if present
  const html = text
    .replace(/^```html?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  return NextResponse.json({ html });
}
