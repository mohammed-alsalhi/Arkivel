"use client";

import type { FormEventHandler, ReactNode, RefObject } from "react";
import CategorySelect, { type CategoryOption } from "@/components/CategorySelect";
import TagPicker from "@/components/TagPicker";
import TiptapEditor, { type TiptapEditorHandle } from "@/components/editor/TiptapEditor";
import { Button, Field, Input, PageHeader, Select } from "@/components/ui";

export type ArticleEditorAutoSaveStatus = "clean" | "unsaved" | "saved" | "restored";

type ArticleEditorFormProps = {
  heading: ReactNode;
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
    <>
      <PageHeader title={heading} />

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="title" htmlFor="article-title">
          <Input
            id="article-title"
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={titlePlaceholder}
            required
          />
        </Field>

        {slugField ? (
          <Field label="slug (url path)" htmlFor="article-slug">
            <div className="flex items-center gap-1 text-[13px] text-muted">
              <span>/articles/</span>
              <Input
                id="article-slug"
                type="text"
                value={slugField.value}
                onChange={(event) => slugField.onChange(event.target.value)}
                required
                className="flex-1 font-mono"
              />
            </div>
          </Field>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="category">
            <CategorySelect value={categoryId} onChange={onCategoryChange} categories={categories} />
          </Field>
          <Field label="tags">
            <TagPicker selectedTagIds={tagIds} onChange={onTagChange} />
          </Field>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="ui-label">content</label>
            <span className="text-[11px] text-muted" aria-live="polite">
              {autoSaveStatus === "restored" && "draft restored"}
              {autoSaveStatus === "unsaved" && "saving draft..."}
              {autoSaveStatus === "saved" && "draft saved"}
            </span>
          </div>
          <TiptapEditor
            ref={editorRef}
            content={initialContent}
            placeholder="begin writing... use [[Article Name]] to create wiki links."
            articleTitle={title}
            onUpdate={onEditorUpdate}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="status" htmlFor="article-status">
            <Select
              id="article-status"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
            >
              <option value="draft">draft</option>
              <option value="review">review</option>
              <option value="published">published</option>
            </Select>
          </Field>
          <label className="flex items-end gap-2 pb-2 text-[13px]">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(event) => onPinnedChange(event.target.checked)}
            />
            <span className="font-bold text-heading">pin to category page</span>
          </label>
        </div>

        {editSummaryField ? (
          <Field label="edit summary" htmlFor="edit-summary">
            <Input
              id="edit-summary"
              type="text"
              value={editSummaryField.value}
              onChange={(event) => editSummaryField.onChange(event.target.value)}
              placeholder="briefly describe your changes..."
            />
          </Field>
        ) : null}

        <div
          className={deleteAction
            ? "flex items-center justify-between border-t border-border pt-3"
            : "flex gap-2 border-t border-border pt-3"}
        >
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? savingLabel : submitLabel}
            </Button>
            <Button onClick={onCancel}>cancel</Button>
          </div>
          {deleteAction ? (
            <Button variant="danger" onClick={deleteAction.onDelete} disabled={deleteAction.deleting}>
              {deleteAction.deleting ? "deleting..." : "delete article"}
            </Button>
          ) : null}
        </div>
      </form>
    </>
  );
}
