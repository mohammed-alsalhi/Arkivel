import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-heading">Learning Paths</h1>
        {session && (
          <Link href="/learning-paths/new" className="px-3 py-1.5 bg-accent text-white text-sm rounded hover:opacity-90">
            Create Path
          </Link>
        )}
      </div>

      {paths.length === 0 ? (
        <p className="text-muted text-sm italic">No learning paths yet. Create one to guide readers through a topic.</p>
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
    </div>
  );
}

export const dynamic = "force-dynamic";
