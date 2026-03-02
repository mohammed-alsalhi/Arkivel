import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const startTime = process.uptime();
  let dbConnected = false;
  let articleCount = 0;

  try {
    articleCount = await prisma.article.count();
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  return NextResponse.json({
    status: dbConnected ? "ok" : "degraded",
    uptime: Math.floor(startTime),
    dbConnected,
    version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
    articleCount,
    timestamp: new Date().toISOString(),
  });
}
