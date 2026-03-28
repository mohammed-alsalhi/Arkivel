"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import TiptapEditor, { type TiptapEditorHandle } from "@/components/editor/TiptapEditor";
import TagPicker from "@/components/TagPicker";
import CategorySelect from "@/components/CategorySelect";
import InfoboxEditor from "@/components/InfoboxEditor";
import { useAdmin } from "@/components/AdminContext";
import ArticleLockGuard from "@/components/ArticleLockGuard";
import FocalPointPicker from "@/components/FocalPointPicker";

type CategoryItem = { id: string; name: string; slug: string; parentId: string | null; children?: CategoryItem[] };

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string | null;
  redirectTo: string | null;
  infobox: Record<string, string> | null;
  status: string;
  isPinned: boolean;
  tags: { tag: { id: string } }[];
};

export default function EditArticlePage() {
  const isAdmin = useAdmin();
  const router = useRouter();
  const params = useParams();
  const editorRef = useRef<TiptapEditorHandle>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [redirectTo, setRedirectTo] = useState("");
  const [infobox, setInfobox] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [editSummary, setEditSummary] = useState("");
  const [status, setStatus] = useState("published");
  const [isPinned, setIsPinned] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);
  const [coverFocalX, setCoverFocalX] = useState(50);
  const [coverFocalY, setCoverFocalY] = useState(50);
  const [expiresAt, setExpiresAt] = useState("");
  const [reviewDueAt, setReviewDueAt] = useState("");
  const [metadataFields, setMetadataFields] = useState<{ name: string; label: string; type: string; options?: string; required?: boolean }[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    if (!categoryId) { setMetadataFields([]); return; }
    fetch(`/api/metadata-schemas/by-category/${categoryId}`)
      .then((r) => r.json())
      .then((d) => setMetadataFields(Array.isArray(d.fields) ? d.fields : []))
      .catch(() => setMetadataFields([]));
  }, [categoryId]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/articles?slug=${params.slug}`);
      if (!res.ok) return;
      const data = await res.json();
      const found = data.articles?.find((a: Article) => a.slug === params.slug);
      if (!found) {
        const searchRes = await fetch(`/api/search?q=${params.slug}&limit=1`);
        if (searchRes.ok) {
          const results = await searchRes.json();
          if (results.length > 0) {
            const detailRes = await fetch(`/api/articles/${results[0].id}`);
            if (detailRes.ok) {
              const articleData = await detailRes.json();
              setArticle(articleData);
              setTitle(articleData.title);
              setSlug(articleData.slug);
              setCategoryId(articleData.categoryId || "");
              setRedirectTo(articleData.redirectTo || "");
              setInfobox(articleData.infobox || {});
              setStatus(articleData.status || "published");
              setIsPinned(articleData.isPinned || false);
              setCoverImage(articleData.coverImage || "");
              setCoverFocalX(articleData.coverFocalX ?? 50);
              setCoverFocalY(articleData.coverFocalY ?? 50);
              setExpiresAt(articleData.expiresAt ? articleData.expiresAt.slice(0, 10) : "");
              setReviewDueAt(articleData.reviewDueAt ? articleData.reviewDueAt.slice(0, 10) : "");
              setAccessPassword(articleData.accessPassword || "");
              setContentWarnings(articleData.contentWarnings || []);
              setTagIds(articleData.tags.map((t: { tag: { id: string } }) => t.tag.id));
            }
          }
        }
        setLoading(false);
        return;
      }
      const detailRes = await fetch(`/api/articles/${found.id}`);
      if (detailRes.ok) {
        const articleData = await detailRes.json();
        setArticle(articleData);
        setTitle(articleData.title);
        setSlug(articleData.slug);
        setCategoryId(articleData.categoryId || "");
        setRedirectTo(articleData.redirectTo || "");
        setInfobox(articleData.infobox || {});
        setStatus(articleData.status || "published");
        setIsPinned(articleData.isPinned || false);
        setCoverImage(articleData.coverImage || "");
        setCoverFocalX(articleData.coverFocalX ?? 50);
        setCoverFocalY(articleData.coverFocalY ?? 50);
        setExpiresAt(articleData.expiresAt ? articleData.expiresAt.slice(0, 10) : "");
        setReviewDueAt(articleData.reviewDueAt ? articleData.reviewDueAt.slice(0, 10) : "");
        setTagIds(articleData.tags.map((t: { tag: { id: string } }) => t.tag.id));
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!article || !editorRef.current) return;

    setSaving(true);
    const content = editorRef.current.getHTML();
    const contentRaw = editorRef.current.getMarkdown();

    const res = await fetch(`/api/articles/${article.id}`, {
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
        redirectTo: redirectTo.trim() || null,
        infobox: Object.keys(infobox).length > 0 ? infobox : null,
        editSummary: editSummary.trim() || null,
        status,
        isPinned,
        coverImage: coverImage.trim() || null,
        coverFocalX,
        coverFocalY,
        expiresAt: expiresAt || null,
        reviewDueAt: reviewDueAt || null,
        accessPassword: accessPassword.trim() || null,
        contentWarnings,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      router.push(`/articles/${updated.slug}`);
    } else {
      const err = await res.json().catch(() => null);
      setSaving(false);
      alert(err?.error || "Failed to update article");
    }
  }

  async function handleDelete() {
    if (!article) return;
    if (!confirm(`Are you sure you want to delete "${article.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    const res = await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/articles");
    } else {
      setDeleting(false);
      alert("Failed to delete article");
    }
  }

  if (!isAdmin) {
    return (
      <div className="wiki-notice">
        You must be <a href="/admin">logged in as admin</a> to edit articles.
      </div>
    );
  }

  if (loading) {
    return <div className="py-8 text-center text-muted italic text-[13px]">Loading...</div>;
  }

  if (!article) {
    return <div className="py-8 text-center text-muted italic text-[13px]">Article not found.</div>;
  }

  return (
    <div>
      {/* Tabs */}
      <div className="wiki-tabs">
        <Link href={`/articles/${article.slug}`} className="wiki-tab">
          Article
        </Link>
        <span className="wiki-tab wiki-tab-active">Editing</span>
        <Link href={`/articles/${article.slug}/history`} className="wiki-tab">
          History
        </Link>
        <Link href={`/articles/${article.slug}/discussion`} className="wiki-tab">
          Discussion
        </Link>
      </div>

      {/* Edit form */}
      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <ArticleLockGuard articleId={article.id} isAdmin={isAdmin} />
        <h1
          className="text-[1.5rem] font-normal text-heading border-b border-border pb-1 mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Editing: {article.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-heading mb-1">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-heading mb-1">Slug (URL path):</label>
            <div className="flex items-center gap-1 text-[13px] text-muted">
              <span>/articles/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                required
                className="flex-1 border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground font-mono focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-heading mb-1">Redirect to (optional):</label>
            <div className="flex items-center gap-1 text-[13px] text-muted">
              <span>/articles/</span>
              <input
                type="text"
                value={redirectTo}
                onChange={(e) => setRedirectTo(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="Leave empty for normal article"
                className="flex-1 border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground font-mono placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
            {redirectTo && (
              <p className="text-[11px] text-muted mt-1">
                Visitors to this article will be redirected to <strong>/articles/{redirectTo}</strong>
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[13px] font-bold text-heading mb-1">Category:</label>
              <CategorySelect value={categoryId} onChange={setCategoryId} categories={categories} />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-heading mb-1">Tags:</label>
              <TagPicker selectedTagIds={tagIds} onChange={setTagIds} />
            </div>
          </div>

          {categoryId && (
            <div>
              <label className="block text-[13px] font-bold text-heading mb-1">Infobox fields:</label>
              <InfoboxEditor
                categoryId={categoryId}
                categories={categories}
                data={infobox}
                onChange={setInfobox}
              />
            </div>
          )}

          {metadataFields.length > 0 && (
            <div>
              <label className="block text-[13px] font-bold text-heading mb-1">Metadata fields:</label>
              <div className="border border-border bg-surface p-3 space-y-2">
                {metadataFields.map((f) => (
                  <div key={f.name}>
                    <label className="block text-[12px] text-muted font-bold mb-0.5">
                      {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {f.type === "boolean" ? (
                      <input
                        type="checkbox"
                        checked={infobox[f.name] === "true"}
                        onChange={(e) => setInfobox({ ...infobox, [f.name]: e.target.checked ? "true" : "false" })}
                      />
                    ) : f.type === "select" ? (
                      <select
                        value={infobox[f.name] ?? ""}
                        onChange={(e) => setInfobox({ ...infobox, [f.name]: e.target.value })}
                        className="w-full border border-border bg-surface px-2 py-1 text-[12px] focus:border-accent focus:outline-none"
                      >
                        <option value="">— Select —</option>
                        {(f.options ?? "").split(",").map((o) => o.trim()).filter(Boolean).map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                        value={infobox[f.name] ?? ""}
                        onChange={(e) => setInfobox({ ...infobox, [f.name]: e.target.value })}
                        required={f.required}
                        className="w-full border border-border bg-surface px-2 py-1 text-[12px] focus:border-accent focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-bold text-heading mb-1">Content:</label>
            <TiptapEditor ref={editorRef} content={article.content} articleTitle={title} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[13px] font-bold text-heading mb-1">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground focus:border-accent focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                <span className="font-bold text-heading">Pin to category page</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-heading mb-1">Expires on:</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-border bg-surface px-3 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none"
              />
              <p className="text-[11px] text-muted mt-0.5">Auto-archives to draft when passed</p>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-heading mb-1">Review due by:</label>
              <input
                type="date"
                value={reviewDueAt}
                onChange={(e) => setReviewDueAt(e.target.value)}
                className="w-full border border-border bg-surface px-3 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none"
              />
              <p className="text-[11px] text-muted mt-0.5">Shows in Content Schedule when overdue</p>
            </div>
          </div>

          {/* Cover image + focal point */}
          <div>
            <label className="block text-[13px] font-bold text-heading mb-1">Cover image URL:</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-border bg-surface px-3 py-1.5 text-[13px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            {coverImage && (
              <div className="mt-2">
                <label className="block text-[13px] font-bold text-heading mb-1">Focal point:</label>
                <FocalPointPicker
                  imageUrl={coverImage}
                  focalX={coverFocalX}
                  focalY={coverFocalY}
                  onChange={(x, y) => { setCoverFocalX(x); setCoverFocalY(y); }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-heading mb-1">Access password (optional):</label>
            <input
              type="text"
              value={accessPassword}
              onChange={(e) => setAccessPassword(e.target.value)}
              placeholder="Leave blank for no password"
              className="w-full border border-border bg-surface px-3 py-1.5 text-[13px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <p className="text-[11px] text-muted mt-0.5">Non-admin readers must enter this to view the article</p>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-heading mb-1">Content warnings:</label>
            <div className="flex flex-wrap gap-2 text-[12px]">
              {["spoilers", "violence", "mature", "sensitive-topics", "strong-language", "medical"].map((w) => (
                <label key={w} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentWarnings.includes(w)}
                    onChange={(e) => setContentWarnings(e.target.checked ? [...contentWarnings, w] : contentWarnings.filter((x) => x !== w))}
                  />
                  <span className="text-foreground capitalize">{w.replace("-", " ")}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-0.5">Selected warnings are shown as a dismissible banner before the article</p>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-heading mb-1">Edit summary:</label>
            <input
              type="text"
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
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
