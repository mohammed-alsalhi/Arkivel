import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function logActivity(params: {
  type: string;
  userId?: string;
  articleId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  // Fire-and-forget: create ActivityEvent record
  prisma.activityEvent
    .create({
      data: {
        type: params.type,
        userId: params.userId || null,
        articleId: params.articleId || null,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
    .catch(() => {
      // Silently ignore errors — activity logging should never break the caller
    });
}

export const ACTIVITY_TYPES: Record<
  string,
  { label: string; icon: string }
> = {
  article_created: { label: "created an article", icon: "+" },
  article_edited: { label: "edited", icon: "\u270E" },
  article_published: { label: "published", icon: "\u2713" },
  discussion_posted: { label: "commented on", icon: "\uD83D\uDCAC" },
  review_requested: { label: "requested a review for", icon: "\uD83D\uDCCB" },
  review_completed: { label: "completed review of", icon: "\u2705" },
  change_request_opened: { label: "suggested changes to", icon: "\uD83D\uDCDD" },
  change_request_accepted: { label: "accepted changes to", icon: "\u2713" },
  user_registered: { label: "joined the wiki", icon: "\uD83D\uDC64" },
};
