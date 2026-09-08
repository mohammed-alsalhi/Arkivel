import Link from "next/link";
import prisma from "@/lib/prisma";
import { RELATION_TYPES } from "@/lib/relations";

type Props = {
  articleId: string;
  articleSlug: string;
};

function getRelationType(relation: string) {
  const types = RELATION_TYPES as Record<string, { label: string; inverse: string; icon: string }>;
  return types[relation] || null;
}

export default async function SemanticRelations({ articleId, articleSlug }: Props) {
  // Get outgoing links from this article
  const outgoing = await prisma.articleLink.findMany({
    where: { sourceId: articleId },
    select: {
      id: true,
      targetSlug: true,
      relation: true,
    },
  });

  // Get incoming links to this article (by slug)
  const incoming = await prisma.articleLink.findMany({
    where: { targetSlug: articleSlug },
    select: {
      id: true,
      relation: true,
      source: { select: { title: true, slug: true } },
    },
  });

  if (outgoing.length === 0 && incoming.length === 0) return null;

  // Resolve outgoing target slugs to titles
  const targetSlugs = outgoing.map((l) => l.targetSlug);
  const targetArticles = await prisma.article.findMany({
    where: { slug: { in: targetSlugs } },
    select: { title: true, slug: true },
  });
  const slugToTitle = new Map(targetArticles.map((a) => [a.slug, a.title]));

  // Group outgoing links by relation type
  const outgoingByRelation = new Map<string, { slug: string; title: string }[]>();
  for (const link of outgoing) {
    const group = outgoingByRelation.get(link.relation) || [];
    group.push({
      slug: link.targetSlug,
      title: slugToTitle.get(link.targetSlug) || link.targetSlug,
    });
    outgoingByRelation.set(link.relation, group);
  }

  // Group incoming links by inverse relation type
  const incomingByRelation = new Map<string, { slug: string; title: string }[]>();
  for (const link of incoming) {
    const relType = getRelationType(link.relation);
    const inverseLabel = relType?.inverse || relType?.label || link.relation;
    const group = incomingByRelation.get(inverseLabel) || [];
    group.push({
      slug: link.source.slug,
      title: link.source.title,
    });
    incomingByRelation.set(inverseLabel, group);
  }

  return (
    <div className="mt-4">
      <h2
        className="text-base font-normal text-heading border-b border-border pb-1 mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Semantic relations
      </h2>

      {/* Outgoing links */}
      {Array.from(outgoingByRelation.entries()).map(([relation, links]) => {
        const relType = getRelationType(relation);
        const icon = relType?.icon || "";
        const label = relType?.label || relation;
        return (
          <div key={`out-${relation}`} className="mb-2">
            <h3 className="text-[13px] font-semibold text-muted mb-0.5">
              {icon} {label}
            </h3>
            <ul className="list-disc pl-6 text-[13px] space-y-0.5">
              {links.map((link) => (
                <li key={link.slug}>
                  <Link href={`/articles/${link.slug}`}>{link.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Incoming links */}
      {Array.from(incomingByRelation.entries()).map(([label, links]) => (
        <div key={`in-${label}`} className="mb-2">
          <h3 className="text-[13px] font-semibold text-muted mb-0.5">
            {label}
          </h3>
          <ul className="list-disc pl-6 text-[13px] space-y-0.5">
            {links.map((link) => (
              <li key={link.slug}>
                <Link href={`/articles/${link.slug}`}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
