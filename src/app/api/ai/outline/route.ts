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
 * POST /api/ai/outline
 * Body: { title: string; summary?: string; style?: "encyclopedic" | "tutorial" | "reference" }
 * Returns: { outline: string[] }  — array of H2/H3 section headings
 */
export async function POST(request: NextRequest) {
  const { title, summary, style } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const provider = getProvider();
  if (!provider) {
    // Return a sensible template outline when AI is not configured
    const template = buildTemplateOutline(title.trim(), style);
    return NextResponse.json({ outline: template, source: "template" });
  }

  const styleGuide =
    style === "tutorial"
      ? "a step-by-step tutorial or how-to guide"
      : style === "reference"
      ? "a reference page or technical documentation"
      : "an encyclopedic wiki article";

  const summaryLine = summary?.trim() ? `\nBrief description: ${summary.trim()}` : "";

  try {
    const { text } = await generateText({
      model: provider("claude-haiku-4-5-20251001"),
      messages: [
        {
          role: "user",
          content: `Generate a structured outline for ${styleGuide} titled "${title.trim()}".${summaryLine}

Return ONLY a JSON array of heading strings, no explanation. Use "## " prefix for H2 sections and "### " for H3 subsections. Aim for 5-10 top-level sections with 0-3 subsections each. Example:
["## Introduction", "## Background", "### History", "### Key Concepts", "## Main Content", "## See Also"]`,
        },
      ],
      maxOutputTokens: 400,
    });

    // Parse the JSON array from the response
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const outline = JSON.parse(match[0]) as string[];
      if (Array.isArray(outline) && outline.length > 0) {
        return NextResponse.json({ outline, source: "ai" });
      }
    }

    // Fallback to template if AI response wasn't parseable
    const template = buildTemplateOutline(title.trim(), style);
    return NextResponse.json({ outline: template, source: "template" });
  } catch {
    const template = buildTemplateOutline(title.trim(), style);
    return NextResponse.json({ outline: template, source: "template" });
  }
}

function buildTemplateOutline(title: string, style?: string): string[] {
  if (style === "tutorial") {
    return [
      "## Overview",
      "## Prerequisites",
      "## Getting Started",
      "## Step-by-Step Guide",
      "### Step 1",
      "### Step 2",
      "### Step 3",
      "## Troubleshooting",
      "## See Also",
    ];
  }
  if (style === "reference") {
    return [
      "## Description",
      "## Syntax",
      "## Parameters",
      "## Return Value",
      "## Examples",
      "## Notes",
      "## See Also",
    ];
  }
  return [
    `## Overview`,
    `## Background`,
    `## ${title}`,
    `### Key Aspects`,
    `### Notable Examples`,
    `## Significance`,
    `## See Also`,
  ];
}
