import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CardGrid, CardLink, EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

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
    <Page width="wide">
      <PageHeader
        title="Canvas"
        description="Visually connect articles with an infinite canvas. Drag article cards, add text notes, and draw connections."
        actions={session && <LinkButton href="/canvas/new" variant="primary">New canvas</LinkButton>}
      />
      {!session && (
        <EmptyState
          title="Sign in required"
          description="Sign in to create and save canvases."
          actions={<LinkButton href="/login" variant="primary">Sign in</LinkButton>}
        />
      )}

      {session && canvases.length === 0 && (
        <EmptyState
          title="No canvases yet"
          description="Create a canvas to map article clusters and idea paths visually."
          actions={<LinkButton href="/canvas/new" variant="primary">Create your first canvas</LinkButton>}
        />
      )}

      {canvases.length > 0 && (
        <CardGrid>
          {canvases.map((c) => (
            <CardLink
              key={c.id}
              href={`/canvas/${c.id}`}
              title={c.name}
              meta={`Updated ${new Date(c.updatedAt).toLocaleDateString()}`}
            />
          ))}
        </CardGrid>
      )}
    </Page>
  );
}
