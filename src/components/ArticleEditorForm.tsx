"use client";

import type { FormEventHandler, RefObject } from "react";
import CategorySelect, { type CategoryOption } from "@/components/CategorySelect";
import TagPicker from "@/components/TagPicker";
import TiptapEditor, { type TiptapEditorHandle } from "@/components/editor/TiptapEditor";

export type ArticleEditorAutoSaveStatus = "clean" | "unsaved" | "saved" | "restored";

type ArticleEditorFormProps = {
  heading: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  title: string;
  onTitleChange: (title: string) => void;
  titlePlaceholder?: string;
  slugField?: {
    value: string;
    onChange: (slug: string) => void;
  };
  categories: CategoryOption[];
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  tagIds: string[];
  onTagChange: (tagIds: string[]) => void;
  editorRef: RefObject<TiptapEditorHandle | null>;
  initialContent: string;
  onEditorUpdate: () => void;
  autoSaveStatus: ArticleEditorAutoSaveStatus;
  status: string;
  onStatusChange: (status: string) => void;
  isPinned: boolean;
  onPinnedChange: (isPinned: boolean) => void;
  editSummaryField?: {
    value: string;
    onChange: (summary: string) => void;
  };
  saving: boolean;
  submitLabel: string;
  savingLabel: string;
  onCancel: () => void;
  deleteAction?: {
    deleting: boolean;
    onDelete: () => void | Promise<void>;
  };
};

export default function ArticleEditorForm({
  heading,
  onSubmit,
  title,
  onTitleChange,
  titlePlaceholder,
  slugField,
  categories,
  categoryId,
  onCategoryChange,
  tagIds,
  onTagChange,
  editorRef,
  initialContent,
  onEditorUpdate,
  autoSaveStatus,
  status,
  onStatusChange,
  isPinned,
  onPinnedChange,
  editSummaryField,
  saving,
  submitLabel,
  savingLabel,
  onCancel,
  deleteAction,
}: ArticleEditorFormProps) {
  return (
    <div className="border border-border bg-surface px-5 py-4">
      <h1
        className="mb-3 border-b border-border pb-1 text-[1.5rem] font-normal text-heading"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {heading}
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-[13px] font-bold text-heading" htmlFor="article-title">
            Title:
          </label>
          <input
            id="article-title"
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={titlePlaceholder}
            required
            className="w-full border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        {slugField ? (
          <div>
            <label className="mb-1 block text-[13px] font-bold text-heading" htmlFor="article-slug">
              Slug (URL path):
            </label>
            <div className="flex items-center gap-1 text-[13px] text-muted">
              <span>/articles/</span>
              <input
                id="article-slug"
                type="text"
                value={slugField.value}
                onChange={(event) => slugField.onChange(event.target.value)}
                required
                className="flex-1 border border-border bg-surface px-3 py-1.5 font-mono text-[14px] text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[13px] font-bold text-heading">Category:</label>
            <CategorySelect value={categoryId} onChange={onCategoryChange} categories={categories} />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-bold text-heading">Tags:</label>
            <TagPicker selectedTagIds={tagIds} onChange={onTagChange} />
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
            onUpdate={onEditorUpdate}
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
              onChange={(event) => onStatusChange(event.target.value)}
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
              onChange={(event) => onPinnedChange(event.target.checked)}
            />
            <span className="font-bold text-heading">Pin to category page</span>
          </label>
        </div>

        {editSummaryField ? (
          <div>
            <label className="mb-1 block text-[13px] font-bold text-heading" htmlFor="edit-summary">
              Edit summary:
            </label>
            <input
              id="edit-summary"
              type="text"
              value={editSummaryField.value}
              onChange={(event) => editSummaryField.onChange(event.target.value)}
              placeholder="Briefly describe your changes..."
              className="w-full border border-border bg-surface px-3 py-1.5 text-[13px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        ) : null}

        <div
          className={deleteAction
            ? "flex items-center justify-between border-t border-border pt-3"
            : "flex gap-2 border-t border-border pt-3"}
        >
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent px-4 py-1.5 text-[13px] font-bold text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? savingLabel : submitLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="border border-border bg-surface-hover px-4 py-1.5 text-[13px] text-foreground hover:bg-surface"
            >
              Cancel
            </button>
          </div>
          {deleteAction ? (
            <button
              type="button"
              onClick={deleteAction.onDelete}
              disabled={deleteAction.deleting}
              className="border border-red-300 bg-surface px-4 py-1.5 text-[13px] text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleteAction.deleting ? "Deleting..." : "Delete article"}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
