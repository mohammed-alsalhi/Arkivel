"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminContext";

type Template = {
  id: string;
  name: string;
  description: string;
  content: string;
  categoryId: string | null;
  isPublic: boolean;
  builtin: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function TemplatesPage() {
  const isAdmin = useAdmin();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchTemplates();
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchTemplates, fetchCategories]);

  function resetForm() {
    setFormName("");
    setFormDescription("");
    setFormContent("");
    setFormCategoryId("");
    setFormIsPublic(true);
    setFormError(null);
    setEditId(null);
  }

  function handleEdit(template: Template) {
    setFormName(template.name);
    setFormDescription(template.description);
    setFormContent(template.content);
    setFormCategoryId(template.categoryId || "");
    setFormIsPublic(template.isPublic);
    setEditId(template.id);
    setShowCreate(true);
    setFormError(null);
  }

  async function handleSave() {
    if (!formName.trim() || !formContent.trim()) {
      setFormError("Name and content are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        content: formContent,
        categoryId: formCategoryId || null,
        isPublic: formIsPublic,
      };

      let res: Response;

      if (editId && !editId.startsWith("builtin-")) {
        // Update existing custom template
        res = await fetch(`/api/templates/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new template
        res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        resetForm();
        setShowCreate(false);
        await fetchTemplates();
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to save template.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchTemplates();
      }
    } catch {
      // Silently fail
    }
  }

  if (!isAdmin) {
    return (
      <div>
        <h1
          className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Article Templates
        </h1>
        <div className="wiki-notice">
          You must be <Link href="/admin">logged in as admin</Link> to manage templates.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Article Templates
      </h1>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-muted">
          Templates provide starting structures when creating new articles.
        </p>
        <button
          onClick={() => {
            if (showCreate) {
              resetForm();
              setShowCreate(false);
            } else {
              resetForm();
              setShowCreate(true);
            }
          }}
          className="border border-border bg-surface-hover px-3 py-1 text-[13px] font-medium hover:bg-surface transition-colors"
        >
          {showCreate ? "Cancel" : "Create template"}
        </button>
      </div>

      {/* Create / Edit form */}
      {showCreate && (
        <div className="wiki-portal mb-5">
          <div className="wiki-portal-header">
            {editId ? "Edit Template" : "New Template"}
          </div>
          <div className="wiki-portal-body space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-muted mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Character Profile"
                className="w-full border border-border px-2 py-1.5 text-[13px] bg-surface"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-muted mb-1">
                Description
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of when to use this template"
                className="w-full border border-border px-2 py-1.5 text-[13px] bg-surface"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-muted mb-1">
                Content (HTML)
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="<h2>Section</h2><p>Content here...</p>"
                rows={10}
                className="w-full border border-border px-2 py-1.5 text-[13px] bg-surface font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-muted mb-1">
                  Default Category
                </label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full border border-border px-2 py-1.5 text-[13px] bg-surface"
                >
                  <option value="">None</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-[13px] pb-1.5">
                  <input
                    type="checkbox"
                    checked={formIsPublic}
                    onChange={(e) => setFormIsPublic(e.target.checked)}
                  />
                  Public template (visible to all editors)
                </label>
              </div>
            </div>
            {formError && (
              <p className="text-[12px] text-red-600">{formError}</p>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !formName.trim() || !formContent.trim()}
              className="border border-border bg-surface-hover px-4 py-1.5 text-[13px] font-medium hover:bg-surface transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : editId ? "Update Template" : "Create Template"}
            </button>
          </div>
        </div>
      )}

      {/* Template list */}
      {loading ? (
        <p className="text-[13px] text-muted italic">Loading templates...</p>
      ) : templates.length === 0 ? (
        <div className="wiki-notice">
          No templates available.
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="wiki-portal">
              <div className="wiki-portal-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{template.name}</span>
                  {template.builtin && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                      BUILT-IN
                    </span>
                  )}
                  {!template.isPublic && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-surface-hover text-muted font-semibold">
                      PRIVATE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPreviewId(previewId === template.id ? null : template.id)
                    }
                    className="text-[11px] text-wiki-link hover:underline"
                  >
                    {previewId === template.id ? "Hide preview" : "Preview"}
                  </button>
                  {!template.builtin && (
                    <>
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-[11px] text-muted hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-[11px] text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="wiki-portal-body">
                <p className="text-[12px] text-muted">
                  {template.description}
                </p>
                {previewId === template.id && (
                  <div className="mt-3 border border-border bg-surface p-3">
                    <div className="text-[11px] font-semibold text-muted mb-2 uppercase">
                      Content Preview
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-[13px] text-foreground"
                      dangerouslySetInnerHTML={{ __html: template.content }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
