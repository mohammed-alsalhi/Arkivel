import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();

  // Clean up session if it exists
  const sessionToken = cookieStore.get("session_token")?.value;
  if (sessionToken) {
    await prisma.session.deleteMany({ where: { token: sessionToken } }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });

  // Clear admin token
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  // Clear session token
  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export const dynamic = "force-dynamic";
