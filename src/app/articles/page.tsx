"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "@/components/AdminContext";
import ArticleStatusBadge from "@/components/ArticleStatusBadge";

export default function ArticlesPageWrapper() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted italic text-[13px]">Loading...</div>}>
      <ArticlesPageContent />
    </Suspense>
  );
}

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  status: string;
  updatedAt: string;
  category: { id: string; slug: string; name: string } | null;
  tags: { tag: { id: string; slug: string; name: string } }[];
};

type Category = {
  id: string;
  slug: string;
  name: string;
};

type Tag = {
  id: string;
  slug: string;
  name: string;
};

function ArticlesPageContent() {
  const isAdmin = useAdmin();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";
  const statusFilter = searchParams.get("status") || "";
  const pageStr = searchParams.get("page") || "1";
  const page = parseInt(pageStr);

  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState("");
  const [batchCategoryId, setBatchCategoryId] = useState("");
  const [batchTagId, setBatchTagId] = useState("");
  const [batchWorking, setBatchWorking] = useState(false);

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const loadData = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    const [articlesRes, catsRes, tagsRes] = await Promise.all([
      fetch(`/api/articles?${params}`),
      fetch("/api/categories"),
      fetch("/api/tags"),
    ]);

    if (articlesRes.ok) {
      const data = await articlesRes.json();
      setArticles(data.articles);
      setTotal(data.total);
    }
    if (catsRes.ok) {
      const cats = await catsRes.json();
      // Flatten nested categories
      const flat: Category[] = [];
      function flatten(list: (Category & { children?: Category[] })[]) {
        for (const c of list) {
          flat.push({ id: c.id, slug: c.slug, name: c.name });
          if (c.children) flatten(c.children);
        }
      }
      flatten(cats);
      setCategories(flat);
    }
    if (tagsRes.ok) {
      setTags(await tagsRes.json());
    }
    setLoading(false);
  }, [category, tag, statusFilter, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === articles.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(articles.map((a) => a.id)));
    }
  }

  async function handleBatchAction() {
    if (!selected.size) return;
    const ids = Array.from(selected);

    if (batchAction === "delete") {
      if (!confirm(`Delete ${ids.length} article${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
      setBatchWorking(true);
      const res = await fetch("/api/articles/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        await loadData();
        setBatchAction("");
      } else {
        alert("Failed to delete articles");
      }
      setBatchWorking(false);
      return;
    }

    if (batchAction === "setCategory") {
      setBatchWorking(true);
      const res = await fetch("/api/articles/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: "setCategory", categoryId: batchCategoryId || null }),
      });
      if (res.ok) {
        await loadData();
        setBatchAction("");
      } else {
        alert("Failed to update category");
      }
      setBatchWorking(false);
      return;
    }

    if (batchAction === "publish" || batchAction === "unpublish") {
      setBatchWorking(true);
      const res = await fetch("/api/articles/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: batchAction }),
      });
      if (res.ok) {
        await loadData();
        setBatchAction("");
      } else {
        alert("Failed to update articles");
      }
      setBatchWorking(false);
      return;
    }

    if (batchAction === "addTag" || batchAction === "removeTag") {
      if (!batchTagId) return;
      setBatchWorking(true);
      const res = await fetch("/api/articles/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: batchAction, tagId: batchTagId }),
      });
      if (res.ok) {
        await loadData();
        setBatchAction("");
        setBatchTagId("");
      } else {
        alert("Failed to update tags");
      }
      setBatchWorking(false);
      return;
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div>
      <h1 className="ui-page-title mb-1">All articles</h1>
      <p className="text-[12px] text-muted mb-3">
        {total} article{total !== 1 ? "s" : ""} in the encyclopedia
        {category && <> &mdash; filtered by category</>}
        {tag && <> &mdash; filtered by tag</>}
      </p>

      {/* Filters */}
      <div className="wiki-notice mb-3">
        <strong>Filter by category: </strong>
        <Link href="/articles" className={!category && !tag ? "font-bold" : ""}>
          All
        </Link>
        {categories.map((cat) => (
          <span key={cat.id}>
            {" | "}
            <Link
              href={`/articles?category=${cat.slug}`}
              className={category === cat.slug ? "font-bold" : ""}
            >
              {cat.name}
            </Link>
          </span>
        ))}
        {tags.length > 0 && (
          <>
            <br />
            <strong>Filter by tag: </strong>
            {tags.map((t, i) => (
              <span key={t.id}>
                {i > 0 && " | "}
                <Link
                  href={`/articles?tag=${t.slug}`}
                  className={tag === t.slug ? "font-bold" : ""}
                >
                  {t.name}
                </Link>
              </span>
            ))}
          </>
        )}
      </div>

      {/* Article list */}
      {loading ? (
        <div className="py-8 text-center text-muted italic text-[13px]">Loading...</div>
      ) : articles.length === 0 ? (
        <div className="ui-empty-state">
          No articles found. <Link href="/articles/new">Create one.</Link>
        </div>
      ) : (
        <table className="ui-table">
          <thead>
            <tr>
              {isAdmin && (
                <th className="w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selected.size === articles.length && articles.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th>Article</th>
              <th className="w-32">Category</th>
              <th className="w-28">Last edited</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                {isAdmin && (
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(article.id)}
                      onChange={() => toggleSelect(article.id)}
                    />
                  </td>
                )}
                <td>
                  <Link href={`/articles/${article.slug}`} className="font-medium">
                    {article.title}
                  </Link>
                  {article.status !== "published" && (
                    <span className="ml-2"><ArticleStatusBadge status={article.status} /></span>
                  )}
                  {article.excerpt && (
                    <span className="text-muted text-[12px]">
                      {" "}&ndash; {article.excerpt.substring(0, 100)}{article.excerpt.length > 100 ? "..." : ""}
                    </span>
                  )}
                </td>
                <td className="text-muted">
                  {article.category ? (
                    <Link href={`/categories/${article.category.slug}`}>
                      {article.category.name}
                    </Link>
                  ) : (
                    <span className="italic">None</span>
                  )}
                </td>
                <td className="text-muted text-[12px]">
                  {formatDate(article.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Batch action bar */}
      {isAdmin && selected.size > 0 && (
        <div className="mt-3 border border-border bg-surface-hover px-3 py-2 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="font-bold text-heading">{selected.size} selected</span>
          <select
            value={batchAction}
            onChange={(e) => setBatchAction(e.target.value)}
            className="ui-select w-auto"
          >
            <option value="">Choose action...</option>
            <option value="setCategory">Set category</option>
            <option value="addTag">Add tag</option>
            <option value="removeTag">Remove tag</option>
            <option value="publish">Publish</option>
            <option value="unpublish">Unpublish</option>
            <option value="delete">Delete</option>
          </select>
          {batchAction === "setCategory" && (
            <select
              value={batchCategoryId}
              onChange={(e) => setBatchCategoryId(e.target.value)}
              className="ui-select w-auto"
            >
              <option value="">None (remove category)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
          {(batchAction === "addTag" || batchAction === "removeTag") && (
            <select
              value={batchTagId}
              onChange={(e) => setBatchTagId(e.target.value)}
              className="ui-select w-auto"
            >
              <option value="">Select tag…</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleBatchAction}
            disabled={!batchAction || batchWorking || ((batchAction === "addTag" || batchAction === "removeTag") && !batchTagId)}
            className={`ui-button disabled:opacity-50 ${
              batchAction === "delete" ? "ui-button-danger" : "ui-button-primary"
            }`}
          >
            {batchWorking ? "Working..." : "Apply"}
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-3 text-[13px] text-muted">
          Pages:{" "}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <span key={p}>
              {p > 1 && " | "}
              <Link
                href={`/articles?${new URLSearchParams({
                  ...(category ? { category } : {}),
                  ...(tag ? { tag } : {}),
                  page: p.toString(),
                })}`}
                className={p === page ? "font-bold" : ""}
              >
                {p}
              </Link>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
