import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { translateArticle } from "@/lib/translation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { targetLocale } = await request.json();
  if (!targetLocale) return NextResponse.json({ error: "targetLocale required" }, { status: 400 });

  if (!process.env.DEEPL_API_KEY && !process.env.GOOGLE_TRANSLATE_API_KEY) {
    return NextResponse.json(
      { error: "Translation service not configured. Set DEEPL_API_KEY or GOOGLE_TRANSLATE_API_KEY." },
      { status: 501 }
    );
  }

  const result = await translateArticle(id, targetLocale);
  return NextResponse.json(result, { status: 201 });
}
