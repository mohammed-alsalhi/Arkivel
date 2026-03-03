import { NextResponse } from "next/server";
import { createVerify } from "crypto";
import prisma from "@/lib/prisma";

function verifyDiscordSignature(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): boolean {
  try {
    const verify = createVerify("sha512");
    verify.update(timestamp + body);
    return verify.verify(
      Buffer.from(publicKey, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) return NextResponse.json({ error: "Discord not configured" }, { status: 501 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature-ed25519") ?? "";
  const timestamp = request.headers.get("x-signature-timestamp") ?? "";

  if (!verifyDiscordSignature(publicKey, signature, timestamp, rawBody)) {
    return new NextResponse("Invalid request signature", { status: 401 });
  }

  const interaction = JSON.parse(rawBody);

  // ACK ping
  if (interaction.type === 1) return NextResponse.json({ type: 1 });

  // Application command
  if (interaction.type === 2) {
    const query = (interaction.data?.options?.[0]?.value as string) ?? "";
    if (!query) {
      return NextResponse.json({
        type: 4,
        data: { content: "Please provide a search query.", flags: 64 },
      });
    }

    const words = query.toLowerCase().split(/\s+/);
    const articles = await prisma.article.findMany({
      where: {
        status: "published",
        AND: words.map((w) => ({
          OR: [
            { title: { contains: w, mode: "insensitive" } },
            { content: { contains: w, mode: "insensitive" } },
          ],
        })),
      },
      select: { title: true, slug: true, excerpt: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://wiki.example.com";

    if (articles.length === 0) {
      return NextResponse.json({
        type: 4,
        data: { content: `No results found for "${query}".`, flags: 64 },
      });
    }

    const lines = articles.map(
      (a) => `**[${a.title}](${baseUrl}/articles/${a.slug})**\n${a.excerpt ?? ""}`
    );
    const content = `**Results for "${query}":**\n\n${lines.join("\n\n")}`;

    return NextResponse.json({ type: 4, data: { content, flags: 64 } });
  }

  return NextResponse.json({ error: "Unknown interaction type" }, { status: 400 });
}
