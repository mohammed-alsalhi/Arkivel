import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function CollectionsPage() {
  const user = await getSession();

  const collections = await prisma.smartCollection.findMany({
    where: user
      ? { OR: [{ isPublic: true }, { userId: user.id }] }
      : { isPublic: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="wiki-tabs">
        <span className="wiki-tab wiki-tab-active">Smart Collections</span>
      </div>
      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-normal text-heading">Smart Collections</h1>
          {user && (
            <Link
              href="/collections/new"
              className="px-3 py-1 text-sm bg-accent text-white rounded hover:bg-accent/90"
            >
              New Collection
            </Link>
          )}
        </div>

        {collections.length === 0 ? (
          <p className="text-muted text-sm">No collections yet.</p>
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
      </div>
    </div>
  );
}
