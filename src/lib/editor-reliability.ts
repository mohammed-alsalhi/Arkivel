export const EDITOR_RELIABILITY_SCHEMA_VERSION = "arkivel.editor-reliability.v1";

export const EDITOR_RELIABILITY_CHECKS = [
  "collaborative-editing",
  "draft-recovery",
  "offline-warning",
  "autosave-repair",
  "paste-cleanup",
  "embed-handling",
  "large-document-performance",
] as const;

export const EDITOR_LARGE_DOCUMENT_FIXTURES = [
  "tables",
  "code-blocks",
  "footnotes",
  "images",
  "wiki-links",
] as const;

export type EditorHealthIssue = {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
};

export type DraftSnapshotInput = {
  articleId: string;
  title: string;
  content: string;
  contentRaw?: string | null;
  savedAt?: number;
};

export const editorReliabilityContract = {
  schemaVersion: EDITOR_RELIABILITY_SCHEMA_VERSION,
  checks: EDITOR_RELIABILITY_CHECKS,
  snapshotFlows: ["restore", "compare", "discard"],
  diagnostics: ["extension load failures", "schema conflicts", "storage unavailable", "offline state", "large document pressure"],
  largeDocumentFixtures: EDITOR_LARGE_DOCUMENT_FIXTURES,
  autosave: {
    debounceMs: 2000,
    storagePrefix: "wiki_draft_",
    repairFields: ["articleId", "title", "content", "contentRaw", "savedAt"],
  },
  collaboration: {
    syncIntervalMs: 2000,
    presenceIntervalMs: 10000,
    recoverableStates: ["offline", "sync-error", "pending-local-update"],
  },
};

export function createDraftSnapshot(input: DraftSnapshotInput) {
  return {
    articleId: input.articleId,
    title: input.title.trim() || "Untitled draft",
    content: input.content,
    contentRaw: input.contentRaw ?? null,
    savedAt: input.savedAt ?? Date.now(),
    schemaVersion: EDITOR_RELIABILITY_SCHEMA_VERSION,
  };
}

export function repairDraftSnapshot(value: unknown): ReturnType<typeof createDraftSnapshot> | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<DraftSnapshotInput> & { schemaVersion?: string };
  if (!candidate.articleId || !candidate.content) return null;
  return createDraftSnapshot({
    articleId: String(candidate.articleId),
    title: String(candidate.title ?? "Untitled draft"),
    content: String(candidate.content),
    contentRaw: candidate.contentRaw ?? null,
    savedAt: typeof candidate.savedAt === "number" ? candidate.savedAt : Date.now(),
  });
}

export function diagnoseEditorHealth(input: {
  extensionsLoaded: string[];
  requiredExtensions: string[];
  schemaNodeNames: string[];
  offline?: boolean;
  storageAvailable?: boolean;
  documentSizeBytes?: number;
}): EditorHealthIssue[] {
  const issues: EditorHealthIssue[] = [];
  const loaded = new Set(input.extensionsLoaded);

  for (const extension of input.requiredExtensions) {
    if (!loaded.has(extension)) {
      issues.push({
        code: "extension-load-failure",
        message: `${extension} did not load.`,
        severity: "error",
      });
    }
  }

  const duplicates = findDuplicates(input.schemaNodeNames);
  for (const duplicate of duplicates) {
    issues.push({
      code: "schema-conflict",
      message: `${duplicate} appears more than once in the editor schema.`,
      severity: "error",
    });
  }

  if (input.offline) {
    issues.push({ code: "offline", message: "The editor is offline and should preserve local drafts.", severity: "warning" });
  }
  if (input.storageAvailable === false) {
    issues.push({ code: "storage-unavailable", message: "Local draft storage is unavailable.", severity: "warning" });
  }
  if ((input.documentSizeBytes ?? 0) > 1_000_000) {
    issues.push({ code: "large-document", message: "Large document performance checks should run before publish.", severity: "info" });
  }

  return issues;
}

export function compareSnapshotContent(current: string, snapshot: string) {
  const currentText = normalizeText(current);
  const snapshotText = normalizeText(snapshot);
  const currentWords = words(currentText);
  const snapshotWords = words(snapshotText);
  return {
    changed: currentText !== snapshotText,
    currentWordCount: currentWords.length,
    snapshotWordCount: snapshotWords.length,
    deltaWords: currentWords.length - snapshotWords.length,
  };
}

export function createLargeDocumentFixture(kind: (typeof EDITOR_LARGE_DOCUMENT_FIXTURES)[number], repetitions = 25) {
  const blocks = {
    tables: "| A | B |\n|---|---|\n| one | two |",
    "code-blocks": "```ts\nconst value = 42;\n```",
    footnotes: "A sourced claim<sup data-footnote=\"source\">1</sup>.",
    images: "<img src=\"/test.png\" alt=\"Test image\" />",
    "wiki-links": "[[Related Article]] connects context.",
  };
  return Array.from({ length: repetitions }, () => blocks[kind]).join("\n\n");
}

function normalizeText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function words(value: string) {
  return value.split(/\s+/).filter(Boolean);
}

function findDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}
