import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EmptyState, Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader
        title="Reading Lists"
        actions={
          user && (
            <button
              onClick={undefined}
              id="new-reading-list-btn"
              className="ui-button ui-button-primary"
            >
              New List
            </button>
          )
        }
      />

      {lists.length === 0 ? (
        <EmptyState title="No reading lists yet." />
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
    </Page>
  );
}

export const dynamic = "force-dynamic";
