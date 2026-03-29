import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

function getWords(html: string): Set<string> {
  const text = html.replace(/<[^>]+>/g, " ").toLowerCase();
  const words = text.match(/\b[a-z]{4,}\b/g) ?? [];
  return new Set(words);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) {
    if (b.has(w)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const SIMILARITY_THRESHOLD = 0.55;

export default async function DuplicateContentPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  const articles = await prisma.article.findMany({
    where: { status: "published", redirectTo: null },
    select: { id: true, title: true, slug: true, content: true },
    orderBy: { title: "asc" },
    // Limit to first 300 to avoid O(n²) timeout on huge wikis
    take: 300,
  });

  const wordSets = articles.map((a) => ({ ...a, words: getWords(a.content) }));

  type Pair = { a: typeof articles[0]; b: typeof articles[0]; similarity: number };
  const pairs: Pair[] = [];

  for (let i = 0; i < wordSets.length; i++) {
    for (let j = i + 1; j < wordSets.length; j++) {
      const sim = jaccardSimilarity(wordSets[i].words, wordSets[j].words);
      if (sim >= SIMILARITY_THRESHOLD) {
        pairs.push({ a: articles[i], b: articles[j], similarity: sim });
      }
    }
  }

  pairs.sort((a, b) => b.similarity - a.similarity);

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Duplicate Content Detector
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Article pairs with Jaccard word similarity ≥ {Math.round(SIMILARITY_THRESHOLD * 100)}%.
        High similarity may indicate duplicate or near-duplicate articles that could be merged.
        Analysed first {Math.min(articles.length, 300)} published articles.
      </p>

      {pairs.length === 0 ? (
        <p className="text-[13px] text-green-600 dark:text-green-400">
          ✓ No highly similar article pairs found.
        </p>
      ) : (
        <div className="border border-border divide-y divide-border">
          {pairs.map(({ a, b, similarity }) => (
            <div key={`${a.id}-${b.id}`} className="px-3 py-2 hover:bg-surface-hover">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-accent w-10 shrink-0">
                  {Math.round(similarity * 100)}%
                </span>
                <Link href={`/articles/${a.slug}`} className="text-[13px] text-wiki-link hover:underline">
                  {a.title}
                </Link>
                <span className="text-[11px] text-muted">↔</span>
                <Link href={`/articles/${b.slug}`} className="text-[13px] text-wiki-link hover:underline">
                  {b.title}
                </Link>
                <div className="flex gap-1 ml-auto shrink-0">
                  <Link href={`/articles/${a.slug}/edit`} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-muted/50">
                    Edit A
                  </Link>
                  <Link href={`/articles/${b.slug}/edit`} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-muted/50">
                    Edit B
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
