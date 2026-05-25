import Link from "next/link";
import { notFound } from "next/navigation";
import { builtInSpaceTemplates, previewSpaceTemplate } from "@/lib/space-templates";

export default async function SpaceTemplatePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = builtInSpaceTemplates.find((item) => item.id === id);
  if (!template) notFound();

  const preview = previewSpaceTemplate(template);

  return (
    <div>
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">{template.name}</div>
        <div className="wiki-portal-body text-[13px] space-y-3">
          <p className="text-muted">{template.description}</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="font-bold text-heading">Categories</p>
              <p>{preview.categoryCount}</p>
            </div>
            <div>
              <p className="font-bold text-heading">Article Templates</p>
              <p>{preview.articleTemplateCount}</p>
            </div>
            <div>
              <p className="font-bold text-heading">Recommended Packs</p>
              <p>{template.recommendedPacks.join(", ")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Starter Structure</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            {template.categoryTree.map((category) => (
              <li key={category.slug}>
                <strong>{category.name}</strong>
                {category.children?.length ? `: ${category.children.map((child) => child.name).join(", ")}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Import Preview</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Local import preview is available through <code className="bg-surface-hover px-1 text-[12px]">POST /api/space-templates</code> with this template id.
          </p>
          <Link href="/help" className="wiki-link">Read template help</Link>
        </div>
      </div>
    </div>
  );
}
