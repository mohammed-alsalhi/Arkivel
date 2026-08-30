"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TiptapEditor, { type TiptapEditorHandle } from "@/components/editor/TiptapEditor";
import TagPicker from "@/components/TagPicker";
import CategorySelect from "@/components/CategorySelect";
import { useAdmin } from "@/components/AdminContext";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: CategoryItem[];
};

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string | null;
  status: string;
  isPinned: boolean;
  updatedAt?: string;
  tags: { tag: { id: string } }[];
};

type ArticleDraft = {
  title?: string;
  slug?: string;
  content?: string;
  categoryId?: string;
  tagIds?: string[];
  status?: string;
  isPinned?: boolean;
  editSummary?: string;
  savedAt?: number;
};

export default function EditArticlePage() {
  const isAdmin = useAdmin();
  const router = useRouter();
  const params = useParams();
  const editorRef = useRef<TiptapEditorHandle>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [editSummary, setEditSummary] = useState("");
  const [status, setStatus] = useState("published");
  const [isPinned, setIsPinned] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draftReady, setDraftReady] = useState(false);
  const [editorRevision, setEditorRevision] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"clean" | "unsaved" | "saved" | "restored">("clean");

  const routeSlug = typeof params.slug === "string" ? params.slug : "";

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!routeSlug) return;

    let cancelled = false;

    async function loadArticle() {
      try {
        const listResponse = await fetch(`/api/articles?slug=${encodeURIComponent(routeSlug)}&limit=1`);
        if (!listResponse.ok) return;

        const list = await listResponse.json();
        const match = Array.isArray(list.articles)
          ? list.articles.find((candidate: Article) => candidate.slug === routeSlug)
          : null;
        if (!match) return;

        const detailResponse = await fetch(`/api/articles/${match.id}`);
        if (!detailResponse.ok) return;

        const articleData = await detailResponse.json() as Article;
        if (cancelled) return;

        let draft: ArticleDraft | null = null;
        try {
          const raw = localStorage.getItem(`wiki_draft_${articleData.id}`);
          if (raw) {
            const candidate = JSON.parse(raw) as ArticleDraft;
            const serverUpdatedAt = articleData.updatedAt ? Date.parse(articleData.updatedAt) : 0;
            if ((candidate.savedAt ?? 0) > serverUpdatedAt) draft = candidate;
          }
        } catch {
          localStorage.removeItem(`wiki_draft_${articleData.id}`);
        }

        setArticle(articleData);
        setTitle(draft?.title ?? articleData.title);
        setSlug(draft?.slug ?? articleData.slug);
        setInitialContent(draft?.content ?? articleData.content);
        setCategoryId(draft?.categoryId ?? articleData.categoryId ?? "");
        setTagIds(draft?.tagIds ?? articleData.tags.map(({ tag }) => tag.id));
        setStatus(draft?.status ?? articleData.status ?? "published");
        setIsPinned(draft?.isPinned ?? Boolean(articleData.isPinned));
        setEditSummary(draft?.editSummary ?? "");
        setAutoSaveStatus(draft ? "restored" : "clean");
        setDraftReady(true);
      } catch {
        // The loading state below resolves to the existing not-found view.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadArticle();
    return () => {
      cancelled = true;
    };
  }, [routeSlug]);

  useEffect(() => {
    if (!article || !draftReady) return;

    const pendingTimer = window.setTimeout(() => setAutoSaveStatus("unsaved"), 0);
    const timer = window.setTimeout(() => {
      try {
        const draft: ArticleDraft = {
          title,
          slug,
          content: editorRef.current?.getHTML() ?? initialContent,
          categoryId,
          tagIds,
          status,
          isPinned,
          editSummary,
          savedAt: Date.now(),
        };
        localStorage.setItem(`wiki_draft_${article.id}`, JSON.stringify(draft));
        setAutoSaveStatus("saved");
      } catch {
        setAutoSaveStatus("unsaved");
      }
    }, 1000);

    return () => {
      window.clearTimeout(pendingTimer);
      window.clearTimeout(timer);
    };
  }, [article, categoryId, draftReady, editSummary, editorRevision, initialContent, isPinned, slug, status, tagIds, title]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!article || !editorRef.current || !title.trim() || !slug.trim()) return;

    setSaving(true);
    const content = editorRef.current.getHTML();
    const contentRaw = editorRef.current.getMarkdown();

    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content,
          contentRaw: contentRaw || null,
          excerpt: content.replace(/<[^>]*>/g, "").substring(0, 200),
          categoryId: categoryId || null,
          tagIds,
          editSummary: editSummary.trim() || null,
          status,
          isPinned,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to update article");
      }

      const updated = await response.json();
      localStorage.removeItem(`wiki_draft_${article.id}`);
      router.push(`/articles/${updated.slug}`);
    } catch (error) {
      setSaving(false);
      window.alert(error instanceof Error ? error.message : "Failed to update article");
    }
  }

  async function handleDelete() {
    if (!article || !window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    const response = await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    if (response.ok) {
      localStorage.removeItem(`wiki_draft_${article.id}`);
      router.push("/articles");
      return;
    }

    setDeleting(false);
    window.alert("Failed to delete article");
  }

  if (!isAdmin) {
    return (
      <div className="wiki-notice">
        You must be <a href="/admin">logged in as admin</a> to edit articles.
      </div>
    );
  }

  if (loading) {
    return <div className="py-8 text-center text-[13px] italic text-muted">Loading...</div>;
  }

  if (!article) {
    return <div className="py-8 text-center text-[13px] italic text-muted">Article not found.</div>;
  }

  return (
    <div>
      <nav className="article-tabbar" aria-label="Article sections">
        <Link href={`/articles/${article.slug}`} className="article-tab">Article</Link>
        <span className="article-tab article-tab-active">Editing</span>
        <Link href={`/articles/${article.slug}/history`} className="article-tab">History</Link>
      </nav>

      <div className="border border-border bg-surface px-5 py-4">
        <h1
          className="mb-3 border-b border-border pb-1 text-[1.5rem] font-normal text-heading"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Editing: {article.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[13px] font-bold text-heading" htmlFor="article-title">
              Title:
            </label>
            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-bold text-heading" htmlFor="article-slug">
              Slug (URL path):
            </label>
            <div className="flex items-center gap-1 text-[13px] text-muted">
              <span>/articles/</span>
              <input
                id="article-slug"
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                required
                className="flex-1 border border-border bg-surface px-3 py-1.5 font-mono text-[14px] text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[13px] font-bold text-heading">Category:</label>
              <CategorySelect value={categoryId} onChange={setCategoryId} categories={categories} />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-bold text-heading">Tags:</label>
              <TagPicker selectedTagIds={tagIds} onChange={setTagIds} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-[13px] font-bold text-heading">Content:</label>
              <span className="text-[11px] text-muted" aria-live="polite">
                {autoSaveStatus === "restored" && "Draft restored"}
                {autoSaveStatus === "unsaved" && "Saving draft..."}
                {autoSaveStatus === "saved" && "Draft saved"}
              </span>
            </div>
            <TiptapEditor
              ref={editorRef}
              content={initialContent}
              placeholder="Begin writing your article... Use [[Article Name]] to create wiki links."
              articleTitle={title}
              onUpdate={() => setEditorRevision((revision) => revision + 1)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[13px] font-bold text-heading" htmlFor="article-status">
                Status:
              </label>
              <select
                id="article-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground focus:border-accent focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2 text-[13px]">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
              />
              <span className="font-bold text-heading">Pin to category page</span>
            </label>
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-bold text-heading" htmlFor="edit-summary">
              Edit summary:
            </label>
            <input
              id="edit-summary"
              type="text"
              value={editSummary}
              onChange={(event) => setEditSummary(event.target.value)}
              placeholder="Briefly describe your changes..."
              className="w-full border border-border bg-surface px-3 py-1.5 text-[13px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent px-4 py-1.5 text-[13px] font-bold text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="border border-border bg-surface-hover px-4 py-1.5 text-[13px] text-foreground hover:bg-surface"
              >
                Cancel
              </button>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="border border-red-300 bg-surface px-4 py-1.5 text-[13px] text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
