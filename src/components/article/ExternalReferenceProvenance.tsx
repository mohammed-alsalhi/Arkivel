import { createProvenanceLabel, type ExternalArkivelReference } from "@/lib/external-references";

export function ExternalReferenceProvenance({ references }: { references: ExternalArkivelReference[] }) {
  if (references.length === 0) return null;

  return (
    <aside className="wiki-notice text-[12px]" aria-label="External reference provenance">
      <ul className="space-y-1">
        {references.map((reference) => (
          <li key={`${reference.instanceId}:${reference.externalId}`}>
            <span className="font-medium">{createProvenanceLabel(reference)}</span>
            <span className="text-muted"> ({reference.instanceId})</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
