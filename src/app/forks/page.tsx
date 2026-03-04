import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ForksPage() {
  const user = await getSession();
  if (!user || !await isAdmin()) redirect("/");

  const forks = await prisma.articleFork.findMany({
    where: { status: "proposed" },
    include: {
      author: { select: { username: true, displayName: true } },
      original: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="wiki-tabs">
        <Link href="/admin" className="wiki-tab">Admin</Link>
        <span className="wiki-tab wiki-tab-active">Proposed Forks</span>
      </div>
      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <h1 className="text-xl font-normal text-heading mb-4">Proposed Article Forks</h1>

        {forks.length === 0 ? (
          <p className="text-sm text-muted">No proposed forks awaiting review.</p>
        ) : (
          <div className="space-y-3">
            {forks.map((fork) => (
              <div key={fork.id} className="border border-border rounded p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{fork.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      Fork of{" "}
                      <Link href={`/articles/${fork.original.slug}`} className="text-wiki-link hover:underline">
                        {fork.original.title}
                      </Link>
                      {" "}by {fork.author.displayName || fork.author.username}
                    </p>
                    {fork.message && <p className="text-xs text-muted mt-1 italic">&ldquo;{fork.message}&rdquo;</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={`/api/forks/${fork.id}`} method="POST">
                      <button
                        formAction={`/api/forks/${fork.id}`}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={async (e) => {
                          e.preventDefault();
                          await fetch(`/api/forks/${fork.id}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "merge" }),
                          });
                          window.location.reload();
                        }}
                      >
                        Merge
                      </button>
                    </form>
                    <button
                      className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                      onClick={async () => {
                        const note = prompt("Rejection note (optional):");
                        await fetch(`/api/forks/${fork.id}`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "reject", reviewNote: note }),
                        });
                        window.location.reload();
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
