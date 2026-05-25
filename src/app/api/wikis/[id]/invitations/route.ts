import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { WORKSPACE_ROLES } from "@/lib/workspaces";
import { logAudit } from "@/lib/audit";

async function isWikiAdmin(wikiId: string, userId: string): Promise<boolean> {
  const membership = await prisma.wikiMembership.findUnique({
    where: { wikiId_userId: { wikiId, userId } },
    select: { role: true },
  });
  return membership?.role === "admin";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: wikiId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!(await isWikiAdmin(wikiId, session.id))) {
    return NextResponse.json({ error: "Wiki admin access required" }, { status: 403 });
  }

  const invitations = await prisma.workspaceInvitation.findMany({
    where: { wikiId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      acceptedAt: true,
      createdAt: true,
      invitedBy: { select: { id: true, username: true, displayName: true } },
      acceptedBy: { select: { id: true, username: true, displayName: true } },
    },
  });

  return NextResponse.json({ invitations });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: wikiId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const wiki = await prisma.wiki.findUnique({ where: { id: wikiId }, select: { id: true, defaultRole: true } });
  if (!wiki) {
    return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
  }

  if (!(await isWikiAdmin(wikiId, session.id))) {
    return NextResponse.json({ error: "Wiki admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const requestedRole = typeof body.role === "string" ? body.role : "";
  const role = WORKSPACE_ROLES.includes(requestedRole as (typeof WORKSPACE_ROLES)[number])
    ? requestedRole
    : wiki.defaultRole;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const invitation = await prisma.workspaceInvitation.create({
    data: {
      wikiId,
      email,
      role,
      token: randomBytes(24).toString("hex"),
      invitedById: session.id,
      expiresAt,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  await logAudit(
    "workspace.invitation_create",
    { type: "workspace", id: wikiId, label: email },
    { role, invitationId: invitation.id, expiresAt: invitation.expiresAt.toISOString() }
  );

  return NextResponse.json(invitation, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: wikiId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!(await isWikiAdmin(wikiId, session.id))) {
    return NextResponse.json({ error: "Wiki admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const action = body.action;
  const invitationId = typeof body.invitationId === "string" ? body.invitationId : "";

  if (!invitationId || !["resend", "revoke"].includes(action)) {
    return NextResponse.json({ error: "invitationId and action=resend|revoke are required" }, { status: 400 });
  }

  const existing = await prisma.workspaceInvitation.findFirst({
    where: { id: invitationId, wikiId },
    select: { id: true, email: true, role: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (action === "revoke") {
    const revoked = await prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: "revoked" },
      select: { id: true, email: true, role: true, status: true, updatedAt: true },
    });
    await logAudit("workspace.invitation_revoke", { type: "workspace", id: wikiId, label: revoked.email }, { invitationId });
    return NextResponse.json(revoked);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);
  const resent = await prisma.workspaceInvitation.update({
    where: { id: invitationId },
    data: {
      status: "pending",
      token: randomBytes(24).toString("hex"),
      expiresAt,
    },
    select: { id: true, email: true, role: true, status: true, expiresAt: true, updatedAt: true },
  });
  await logAudit(
    "workspace.invitation_resend",
    { type: "workspace", id: wikiId, label: resent.email },
    { invitationId, expiresAt: resent.expiresAt.toISOString() }
  );
  return NextResponse.json(resent);
}

export const dynamic = "force-dynamic";
