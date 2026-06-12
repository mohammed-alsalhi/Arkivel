import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

export default async function CollectionsPage() {
  const user = await getSession();

  const collections = await prisma.smartCollection.findMany({
    where: user
      ? { OR: [{ isPublic: true }, { userId: user.id }] }
      : { isPublic: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Page>
      <PageHeader
        title="Smart Collections"
        actions={user && <LinkButton href="/collections/new">New Collection</LinkButton>}
      />

      {collections.length === 0 ? (
        <EmptyState title="No collections yet." />
      ) : (
        <div className="grid gap-3">
          {collections.map((col) => (
            <div key={col.id} className="border border-border rounded p-3 hover:border-accent/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/collections/${col.id}`} className="text-wiki-link font-medium hover:underline">
                    {col.name}
                  </Link>
                  {col.isPublic && (
                    <span className="ml-2 text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border text-muted">
                      Public
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export const dynamic = "force-dynamic";
