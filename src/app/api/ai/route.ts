import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { summarizeArticle, suggestRelatedTopics, generateContent } from "@/lib/ai";

// POST /api/ai
// Dispatches to AI features based on `action`.
// Body: { action: "summarize"|"suggest"|"generate", content?, title?, tags?, prompt? }
// Returns: { result: string | string[] }
// Authentication required.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Guard: AI not configured
  if (!process.env.AI_API_KEY) {
    return NextResponse.json(
      { error: "AI features are not configured on this server" },
      { status: 501 }
    );
  }

  try {
    const body = await request.json();
    const { action, content, title, tags, prompt } = body;

    switch (action) {
      case "summarize": {
        if (!content) {
          return NextResponse.json(
            { error: "content is required for summarize action" },
            { status: 400 }
          );
        }
        const result = await summarizeArticle(content as string);
        return NextResponse.json({ result });
      }

      case "suggest": {
        if (!title) {
          return NextResponse.json(
            { error: "title is required for suggest action" },
            { status: 400 }
          );
        }
        const result = await suggestRelatedTopics(
          title as string,
          (content as string) || "",
          Array.isArray(tags) ? (tags as string[]) : []
        );
        return NextResponse.json({ result });
      }

      case "generate": {
        if (!prompt) {
          return NextResponse.json(
            { error: "prompt is required for generate action" },
            { status: 400 }
          );
        }
        const result = await generateContent(
          prompt as string,
          content as string | undefined
        );
        return NextResponse.json({ result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: '${action}'. Valid actions: summarize, suggest, generate` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
