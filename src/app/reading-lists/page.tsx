import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function ReadingListsPage() {
  const user = await getSession();

  const lists = await prisma.readingList.findMany({
    where: user
      ? { OR: [{ isPublic: true }, { userId: user.id }] }
      : { isPublic: true },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="wiki-tabs">
        <span className="wiki-tab wiki-tab-active">Reading Lists</span>
      </div>
      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-normal text-heading">Reading Lists</h1>
          {user && (
            <button
              onClick={undefined}
              id="new-reading-list-btn"
              className="px-3 py-1 text-sm bg-accent text-white rounded hover:bg-accent/90"
            >
              New List
            </button>
          )}
        </div>

        {lists.length === 0 ? (
          <p className="text-sm text-muted">No reading lists yet.</p>
        ) : (
          <div className="grid gap-3">
            {lists.map((list) => (
              <div key={list.id} className="border border-border rounded p-3 hover:border-accent/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/reading-lists/${list.id}`} className="text-wiki-link font-medium hover:underline">
                      {list.name}
                    </Link>
                    {list.isPublic && (
                      <span className="ml-2 text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border text-muted">
                        Public
                      </span>
                    )}
                    {list.description && (
                      <p className="text-xs text-muted mt-0.5">{list.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted shrink-0 ml-3">
                    {list._count.items} article{list._count.items !== 1 ? "s" : ""}
                  </span>
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
