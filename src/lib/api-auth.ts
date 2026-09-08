import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export type ApiKeyUser = {
  id: string;
  userId: string;
  keyName: string;
};

export async function validateApiKey(
  request: NextRequest
): Promise<ApiKeyUser | null> {
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey) return null;

  const keyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { user: { select: { id: true, username: true } } },
  });

  if (!keyRecord) return null;

  // Update last used timestamp (fire-and-forget)
  prisma.apiKey
    .update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    id: keyRecord.id,
    userId: keyRecord.userId,
    keyName: keyRecord.name,
  };
}
