import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

export default async function LearningPathsPage() {
  const session = await getSession();
  const paths = await prisma.learningPath.findMany({
    where: { isPublic: true },
    include: {
      author: { select: { username: true, displayName: true } },
      _count: { select: { articles: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Page>
      <PageHeader
        title="Learning Paths"
        actions={
          session && (
            <LinkButton href="/learning-paths/new">Create Path</LinkButton>
          )
        }
      />

      {paths.length === 0 ? (
        <EmptyState
          title="No learning paths yet."
          description="Create one to guide readers through a topic."
        />
      ) : (
        <div className="space-y-4">
          {paths.map((path) => (
            <Link
              key={path.id}
              href={`/learning-paths/${path.id}`}
              className="block border border-border rounded p-4 hover:bg-surface-hover transition-colors"
            >
              <div className="font-medium text-foreground">{path.name}</div>
              {path.description && (
                <div className="text-sm text-muted mt-1 line-clamp-2">{path.description}</div>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                <span>{path._count.articles} articles</span>
                {path.author && <span>by {path.author.displayName || path.author.username}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}

export const dynamic = "force-dynamic";
