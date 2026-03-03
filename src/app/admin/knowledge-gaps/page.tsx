import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-heading">Knowledge Gaps</h1>
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          ← Admin
        </Link>
      </div>

      <p className="text-sm text-muted mb-6">
        Topics referenced via wiki links but not yet covered by any article, sorted by number of
        incoming references.
      </p>

      {gaps.length === 0 ? (
        <div className="text-sm text-muted italic">
          No knowledge gaps found — all wiki links point to existing articles.
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted text-xs uppercase">
              <th className="py-2 pr-4">Missing topic</th>
              <th className="py-2 pr-4 text-center">References</th>
              <th className="py-2">Referenced by</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {gaps.map((gap) => (
              <tr key={gap.title} className="border-b border-border hover:bg-surface-hover">
                <td className="py-2 pr-4 font-medium">{gap.title}</td>
                <td className="py-2 pr-4 text-center text-muted">{gap.count}</td>
                <td className="py-2 pr-4 text-muted text-xs">
                  {gap.referencedBy.slice(0, 3).join(", ")}
                  {gap.referencedBy.length > 3 && ` +${gap.referencedBy.length - 3} more`}
                </td>
                <td className="py-2">
                  <Link
                    href={`/admin/articles/new?title=${encodeURIComponent(gap.title)}&slug=${encodeURIComponent(generateSlug(gap.title))}`}
                    className="text-accent hover:underline text-xs whitespace-nowrap"
                  >
                    Create article
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
