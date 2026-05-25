export const EXTERNAL_REFERENCE_SCHEMA_VERSION = "arkivel.external-reference.v1";

export const EXTERNAL_REFERENCE_TYPES = ["article", "space", "source", "imported-snapshot"] as const;
export const EXTERNAL_REFERENCE_RELATIONS = ["imported-from", "mirrored-from", "references", "derived-from"] as const;
export const EXTERNAL_REFERENCE_PRIVACY_LEVELS = ["public-indexable", "authenticated-only", "private", "sensitive"] as const;

export type ExternalReferenceType = (typeof EXTERNAL_REFERENCE_TYPES)[number];
export type ExternalReferenceRelation = (typeof EXTERNAL_REFERENCE_RELATIONS)[number];
export type ExternalReferencePrivacyLevel = (typeof EXTERNAL_REFERENCE_PRIVACY_LEVELS)[number];

export type ExternalArkivelReference = {
  canonicalUrl?: string;
  checksum?: string;
  externalId: string;
  instanceBaseUrl: string;
  instanceId: string;
  label: string;
  lastSeenAt?: string;
  privacy: ExternalReferencePrivacyLevel;
  relation: ExternalReferenceRelation;
  type: ExternalReferenceType;
};

export type ExternalReferenceDiagnostic = {
  code: "missing-url" | "stale-checksum" | "private-index-leak" | "unreachable-instance" | "unknown-relation";
  message: string;
  referenceId: string;
  severity: "blocked" | "warning" | "info";
};

export const externalReferenceContract = {
  apiRoute: "/api/external-references",
  docs: "docs/external-references.md",
  metadataTypes: EXTERNAL_REFERENCE_TYPES,
  privacyLevels: EXTERNAL_REFERENCE_PRIVACY_LEVELS,
  provenanceRelations: EXTERNAL_REFERENCE_RELATIONS,
  publicIndex: {
    centralIndex: false,
    excludedPrivacy: ["authenticated-only", "private", "sensitive"],
    includedFields: ["instanceId", "type", "externalId", "label", "canonicalUrl", "checksum"],
    note: "Public indexes may list only explicit public-indexable references and must not centralize private spaces or sensitive article metadata.",
  },
  schemaVersion: EXTERNAL_REFERENCE_SCHEMA_VERSION,
} as const;

export function createExternalReference(input: ExternalArkivelReference): ExternalArkivelReference {
  return {
    ...input,
    canonicalUrl: input.canonicalUrl ?? `${input.instanceBaseUrl.replace(/\/$/, "")}/external/${input.type}/${input.externalId}`,
  };
}

export function createProvenanceLabel(reference: Pick<ExternalArkivelReference, "label" | "relation">) {
  const prefix = reference.relation === "mirrored-from" ? "Mirrored from" : reference.relation === "imported-from" ? "Imported from" : "References";
  return `${prefix} ${reference.label}`;
}

export function isPublicIndexableReference(reference: Pick<ExternalArkivelReference, "privacy" | "canonicalUrl">) {
  return reference.privacy === "public-indexable" && Boolean(reference.canonicalUrl);
}

export function createExternalReferenceDiagnostics(references: ExternalArkivelReference[]): ExternalReferenceDiagnostic[] {
  return references.flatMap((reference) => {
    const diagnostics: ExternalReferenceDiagnostic[] = [];
    if (!reference.canonicalUrl) {
      diagnostics.push({
        code: "missing-url",
        message: "External reference is missing a canonical URL.",
        referenceId: reference.externalId,
        severity: "warning",
      });
    }
    if (reference.privacy !== "public-indexable" && reference.canonicalUrl?.includes("/public-index/")) {
      diagnostics.push({
        code: "private-index-leak",
        message: "Private or sensitive references must not be included in public index URLs.",
        referenceId: reference.externalId,
        severity: "blocked",
      });
    }
    if (reference.lastSeenAt) {
      const seenAt = new Date(reference.lastSeenAt).getTime();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      if (!Number.isNaN(seenAt) && Date.now() - seenAt > ninetyDays) {
        diagnostics.push({
          code: "unreachable-instance",
          message: "External reference has not been confirmed recently.",
          referenceId: reference.externalId,
          severity: "warning",
        });
      }
    }
    return diagnostics;
  });
}

export function createPublicIndexPlan(references: ExternalArkivelReference[]) {
  const indexable = references.filter(isPublicIndexableReference);
  const omitted = references.filter((reference) => !isPublicIndexableReference(reference));

  return {
    centralIndex: false,
    indexable: indexable.map((reference) => ({
      canonicalUrl: reference.canonicalUrl,
      checksum: reference.checksum,
      externalId: reference.externalId,
      instanceId: reference.instanceId,
      label: reference.label,
      type: reference.type,
    })),
    omitted: omitted.map((reference) => ({
      externalId: reference.externalId,
      privacy: reference.privacy,
      reason: reference.privacy === "public-indexable" ? "missing canonical URL" : "privacy level is not public-indexable",
    })),
  };
}

export function createExternalReferenceReport() {
  const references = [
    createExternalReference({
      checksum: "sha256:example-article",
      externalId: "article/getting-started",
      instanceBaseUrl: "https://docs.example.test",
      instanceId: "arkivel-docs",
      label: "Getting Started",
      lastSeenAt: "2026-05-25T00:00:00.000Z",
      privacy: "public-indexable",
      relation: "imported-from",
      type: "article",
    }),
    createExternalReference({
      checksum: "sha256:private-space",
      externalId: "space/team-handbook",
      instanceBaseUrl: "https://team.example.test",
      instanceId: "arkivel-team",
      label: "Team Handbook",
      privacy: "private",
      relation: "mirrored-from",
      type: "space",
    }),
  ];

  return {
    contract: externalReferenceContract,
    diagnostics: createExternalReferenceDiagnostics(references),
    provenanceLabels: references.map(createProvenanceLabel),
    publicIndexPlan: createPublicIndexPlan(references),
    references,
  };
}
