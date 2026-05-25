import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { logAudit, type AuditAction } from "@/lib/audit";
import { normalizeSuggestionStatus, type SuggestionReviewAction } from "@/lib/moderation";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/suggestions/[id] — admin: accept/reject/comment/assign/convert suggestion
 * DELETE /api/suggestions/[id] — admin: delete suggestion
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { action, status, adminNote, assigneeId, reviewerComment, convertedTaskUrl } = await request.json();
  const reviewAction = normalizeAction(action, status);
  if (!reviewAction) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const nextStatus = statusForAction(reviewAction, status);

  const updated = await prisma.editSuggestion.update({
    where: { id },
    data: {
      status: nextStatus,
      adminNote: adminNote ?? undefined,
      assigneeId: reviewAction === "assign" ? assigneeId ?? null : undefined,
      reviewerComment: reviewAction === "comment" ? reviewerComment ?? adminNote ?? null : undefined,
      convertedTaskUrl: reviewAction === "convert-to-task" ? convertedTaskUrl ?? null : undefined,
    },
    include: { article: { select: { title: true, slug: true } } },
  });
  await logAudit(auditActionForSuggestion(reviewAction), {
    type: "edit-suggestion",
    id,
    label: updated.article.title,
  }, {
    adminNote,
    assigneeId,
    convertedTaskUrl,
    reviewerComment,
    status: nextStatus,
  }, { request });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.editSuggestion.delete({ where: { id } });
  await logAudit("suggestion.delete", { type: "edit-suggestion", id }, undefined, { request: _request });
  return NextResponse.json({ ok: true });
}

function normalizeAction(action: unknown, status: unknown): SuggestionReviewAction | null {
  if (action === "accept" || action === "reject" || action === "comment" || action === "assign" || action === "convert-to-task") {
    return action;
  }
  if (status === "accepted") return "accept";
  if (status === "rejected") return "reject";
  if (status === "commented") return "comment";
  if (status === "assigned") return "assign";
  if (status === "converted") return "convert-to-task";
  return null;
}

function statusForAction(action: SuggestionReviewAction, explicitStatus: unknown) {
  const normalized = normalizeSuggestionStatus(explicitStatus);
  if (normalized) return normalized;
  return {
    accept: "accepted",
    reject: "rejected",
    comment: "commented",
    assign: "assigned",
    "convert-to-task": "converted",
  }[action];
}

function auditActionForSuggestion(action: SuggestionReviewAction): AuditAction {
  const actions: Record<SuggestionReviewAction, AuditAction> = {
    accept: "suggestion.accept",
    reject: "suggestion.reject",
    comment: "suggestion.comment",
    assign: "suggestion.assign",
    "convert-to-task": "suggestion.convert_to_task",
  };
  return actions[action];
}
