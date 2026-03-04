import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });
}

/**
 * POST /api/digest — send daily digest to all opted-in users.
 * Intended to be triggered by a cron job (e.g. Vercel Cron, GitHub Actions).
 * Requires admin auth or the CRON_SECRET header.
 */
export async function POST(request: Request) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    const denied = requireAdmin(await isAdmin());
    if (denied) return denied;
  }

  const transporter = getTransporter();
  if (!transporter) {
    return NextResponse.json({ error: "SMTP not configured (set SMTP_HOST)" }, { status: 503 });
  }

  const from = process.env.SMTP_FROM || "wiki@localhost";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find users with digest enabled
  const prefs = await prisma.userPreference.findMany({
    include: { user: { select: { id: true, email: true, displayName: true } } },
  });

  const digestUsers = prefs.filter((p) => {
    const data = p.data as Record<string, unknown>;
    return data.digestEnabled === true && p.user.email;
  });

  let sent = 0;

  for (const pref of digestUsers) {
    // Get watched articles updated since yesterday
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: pref.user.id },
      include: {
        article: {
          select: { id: true, title: true, slug: true, excerpt: true, updatedAt: true },
        },
      },
    });

    const updatedArticles = watchlist
      .map((w) => w.article)
      .filter((a) => a && a.updatedAt >= since);
    if (updatedArticles.length === 0) continue;

    const lines = updatedArticles
      .map((a) => `• <a href="${baseUrl}/articles/${a!.slug}">${a!.title}</a>`)
      .join("<br>");

    await transporter.sendMail({
      from,
      to: pref.user.email,
      subject: `Your Wiki Daily Digest — ${updatedArticles.length} update${updatedArticles.length > 1 ? "s" : ""}`,
      html: `
        <p>Hi ${pref.user.displayName || pref.user.email},</p>
        <p>Here are the articles you're watching that were updated in the last 24 hours:</p>
        <p>${lines}</p>
        <p><a href="${baseUrl}/watchlist">View your watchlist</a> &nbsp;·&nbsp; <a href="${baseUrl}/settings">Manage digest settings</a></p>
      `,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}

export const dynamic = "force-dynamic";
