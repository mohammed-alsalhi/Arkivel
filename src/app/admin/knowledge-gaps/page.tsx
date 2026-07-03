import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { DataTable, EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

async function getKnowledgeGaps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/ai/knowledge-gaps`, {
    cache: "no-store",
    headers: { Cookie: "" },
  });
  if (!res.ok) return [];
  const { gaps } = await res.json();
  return gaps as { title: string; count: number; referencedBy: string[] }[];
}

export default async function KnowledgeGapsPage() {
  if (!(await isAdmin())) redirect("/login");

  let gaps: { title: string; count: number; referencedBy: string[] }[] = [];
  try {
    gaps = await getKnowledgeGaps();
  } catch {
    gaps = [];
  }

  return (
    <Page>
      <PageHeader
        title="Knowledge Gaps"
        description="Topics referenced via wiki links but not yet covered by any article, sorted by number of incoming references."
        actions={<LinkButton href="/admin">← Admin</LinkButton>}
      />

      {gaps.length === 0 ? (
        <EmptyState title="No knowledge gaps found — all wiki links point to existing articles." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Missing topic</th>
              <th className="text-center">References</th>
              <th>Referenced by</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {gaps.map((gap) => (
              <tr key={gap.title}>
                <td className="font-medium">{gap.title}</td>
                <td className="text-center text-muted">{gap.count}</td>
                <td className="text-muted text-xs">
                  {gap.referencedBy.slice(0, 3).join(", ")}
                  {gap.referencedBy.length > 3 && ` +${gap.referencedBy.length - 3} more`}
                </td>
                <td>
                  <Link
                    href={`/articles/new?title=${encodeURIComponent(gap.title)}&slug=${encodeURIComponent(generateSlug(gap.title))}`}
                    className="text-accent hover:underline text-xs whitespace-nowrap"
                  >
                    Create article
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Page>
  );
}
