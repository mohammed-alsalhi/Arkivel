"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

type NewArticleDraft = {
  title?: string;
  content?: string;
  categoryId?: string;
  tagIds?: string[];
  status?: string;
  isPinned?: boolean;
  savedAt?: number;
};

const DRAFT_KEY = "wiki_draft_new";

export default function NewArticlePage() {
  const isAdmin = useAdmin();
  const router = useRouter();
  const editorRef = useRef<TiptapEditorHandle>(null);
  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState("published");
  const [isPinned, setIsPinned] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [editorRevision, setEditorRevision] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"clean" | "unsaved" | "saved" | "restored">("clean");

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw) as NewArticleDraft;
          setTitle(draft.title ?? "");
          setInitialContent(draft.content ?? "");
          setCategoryId(draft.categoryId ?? "");
          setTagIds(Array.isArray(draft.tagIds) ? draft.tagIds : []);
          setStatus(draft.status ?? "published");
          setIsPinned(Boolean(draft.isPinned));
          setAutoSaveStatus("restored");
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      } finally {
        setDraftReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!draftReady) return;

    const pendingTimer = window.setTimeout(() => setAutoSaveStatus("unsaved"), 0);
    const timer = window.setTimeout(() => {
      const content = editorRef.current?.getHTML() ?? initialContent;
      const hasDraft = Boolean(
        title.trim()
        || content.replace(/<[^>]*>/g, "").trim()
        || categoryId
        || tagIds.length
        || status !== "published"
        || isPinned,
      );

      try {
        if (!hasDraft) {
          localStorage.removeItem(DRAFT_KEY);
          setAutoSaveStatus("clean");
          return;
        }

        const draft: NewArticleDraft = {
          title,
          content,
          categoryId,
          tagIds,
          status,
          isPinned,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setAutoSaveStatus("saved");
      } catch {
        setAutoSaveStatus("unsaved");
      }
    }, 1000);

    return () => {
      window.clearTimeout(pendingTimer);
      window.clearTimeout(timer);
    };
  }, [categoryId, draftReady, editorRevision, initialContent, isPinned, status, tagIds, title]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !editorRef.current) return;

    setSaving(true);
    const content = editorRef.current.getHTML();
    const contentRaw = editorRef.current.getMarkdown();

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          contentRaw: contentRaw || null,
          categoryId: categoryId || null,
          tagIds,
          status,
          isPinned,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to create article");
      }

      const article = await response.json();
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/articles/${article.slug}`);
    } catch (error) {
      setSaving(false);
      window.alert(error instanceof Error ? error.message : "Failed to create article");
    }
  }

  if (!isAdmin) {
    return (
      <div className="wiki-notice">
        You must be <a href="/admin">logged in as admin</a> to create articles.
      </div>
    );
  }

  return (
    <div>
      <nav className="article-tabbar" aria-label="Article sections">
        <span className="article-tab article-tab-active">Creating</span>
      </nav>

      <div className="border border-border bg-surface px-5 py-4">
        <h1
          className="mb-3 border-b border-border pb-1 text-[1.5rem] font-normal text-heading"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Create new article
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
              placeholder="Article title..."
              required
              className="w-full border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
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
              <label className="block text-[13px] font-bold text-heading">Content:</label>
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

          <div className="flex gap-2 border-t border-border pt-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent px-4 py-1.5 text-[13px] font-bold text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create article"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-border bg-surface-hover px-4 py-1.5 text-[13px] text-foreground hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
