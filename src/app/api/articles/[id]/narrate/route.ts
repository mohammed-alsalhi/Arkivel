import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSpeechBuffer, htmlToSpeakableText } from "@/lib/tts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: { content: true, status: true },
  });
  if (!article || article.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ElevenLabs not configured. Use browser TTS instead.", browserTts: true },
      { status: 501 }
    );
  }

  const text = htmlToSpeakableText(article.content);
  const buffer = await generateSpeechBuffer(text.slice(0, 5000)); // Limit to 5k chars

  if (!buffer) {
    return NextResponse.json(
      { error: "TTS generation failed. Use browser TTS instead.", browserTts: true },
      { status: 502 }
    );
  }

  const ab = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;

  return new NextResponse(ab, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
