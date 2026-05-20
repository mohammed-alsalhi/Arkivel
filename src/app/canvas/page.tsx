import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CanvasPage() {
  const session = await getSession();

  // Load user's canvases server-side
  const canvases = session
    ? await prisma.canvas.findMany({
        where: { userId: session.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, updatedAt: true },
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Canvas</h1>
          <p className="text-sm text-muted mt-1">
            Visually connect articles with an infinite canvas. Drag article cards, add text notes, and draw connections.
          </p>
        </div>
        {session && (
          <form action="/api/canvas" method="post">
            <Link
              href="/canvas/new"
              className="ui-button ui-button-primary"
            >
              New canvas
            </Link>
          </form>
        )}
      </div>

      {!session && (
        <div className="ui-empty-state">
          <p>Sign in to create and save canvases.</p>
          <Link href="/login" className="ui-button mt-3">
            Sign in
          </Link>
        </div>
      )}

      {session && canvases.length === 0 && (
        <div className="ui-empty-state">
          <p className="text-sm">No canvases yet.</p>
          <Link
            href="/canvas/new"
            className="ui-button mt-3"
          >
            Create your first canvas
          </Link>
        </div>
      )}

      {canvases.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canvases.map((c) => (
            <Link
              key={c.id}
              href={`/canvas/${c.id}`}
              className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="font-medium text-heading text-sm">{c.name}</div>
              <div className="text-[11px] text-muted mt-1">
                Updated {new Date(c.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
