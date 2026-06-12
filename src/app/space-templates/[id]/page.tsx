import Link from "next/link";
import { notFound } from "next/navigation";
import { builtInSpaceTemplates, previewSpaceTemplate } from "@/lib/space-templates";
import { Page, PageHeader, Section, StatCard, StatGrid } from "@/components/ui";

export default async function SpaceTemplatePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = builtInSpaceTemplates.find((item) => item.id === id);
  if (!template) notFound();

  const preview = previewSpaceTemplate(template);

  return (
    <Page>
      <PageHeader title={template.name} description={template.description} />

      <StatGrid>
        <StatCard label="Categories" value={preview.categoryCount} />
        <StatCard label="Article Templates" value={preview.articleTemplateCount} />
        <StatCard label="Recommended Packs" value={template.recommendedPacks.join(", ")} />
      </StatGrid>

      <Section title="Starter Structure">
        <ul className="list-disc pl-5 space-y-1 text-[13px]">
          {template.categoryTree.map((category) => (
            <li key={category.slug}>
              <strong>{category.name}</strong>
              {category.children?.length ? `: ${category.children.map((child) => child.name).join(", ")}` : ""}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Import Preview">
        <div className="text-[13px]">
          <p className="mb-2">
            Local import preview is available through <code className="bg-surface-hover px-1 text-[12px]">POST /api/space-templates</code> with this template id.
          </p>
          <Link href="/help" className="wiki-link">Read template help</Link>
        </div>
      </Section>
    </Page>
  );
}
