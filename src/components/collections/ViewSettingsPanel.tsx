"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import type { ViewDTO } from "@/modules/collections/model";
import type { PropertySchema, ViewConfig } from "@/modules/collections/properties";
import { api, describeFailure } from "./api";

type Props = {
  collectionId: string;
  schema: PropertySchema;
  view: ViewDTO;
  viewCount: number;
  onSaved: (view: ViewDTO) => void;
  onDeleted: () => void;
  onClose: () => void;
};

/** A flat section for a view's name, visible columns, sort, group, and default flag. */
export function ViewSettingsPanel({ collectionId, schema, view, viewCount, onSaved, onDeleted, onClose }: Props) {
  const [name, setName] = useState(view.name);
  const [config, setConfig] = useState<ViewConfig>(view.config);
  const [isDefault, setIsDefault] = useState(view.isDefault);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const sort = config.sorts[0];
  const groupable = schema.filter((property) => property.type === "select" || property.type === "person" || property.type === "checkbox");
  const persisted = Boolean(view.id);

  const toggleVisible = (id: string, visible: boolean) =>
    setConfig((current) => ({
      ...current,
      visible: visible
        ? schema.map((property) => property.id).filter((entry) => entry === id || current.visible.includes(entry))
        : current.visible.filter((entry) => entry !== id),
    }));

  const save = async () => {
    setSaving(true);
    setError("");
    const result = await api<ViewDTO>(`/api/collections/${encodeURIComponent(collectionId)}/views/${encodeURIComponent(view.id)}`, {
      method: "PATCH",
      body: { name, config, ...(isDefault && !view.isDefault ? { isDefault: true } : {}) },
    });
    setSaving(false);
    if (!result.ok) {
      setError(describeFailure(result));
      return;
    }
    onSaved(result.data);
  };

  const remove = async () => {
    setSaving(true);
    const result = await api(`/api/collections/${encodeURIComponent(collectionId)}/views/${encodeURIComponent(view.id)}`, { method: "DELETE" });
    setSaving(false);
    if (!result.ok) {
      setError(describeFailure(result));
      setConfirmDelete(false);
      return;
    }
    onDeleted();
  };

  return (
    <section className="collections-panel" aria-label="view settings">
      <div className="collections-panel-header">
        <h2 className="ui-section-title">view</h2>
        <div className="ui-section-actions">
          <Button onClick={onClose}>cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving || !persisted}>
            {saving ? "saving…" : "save"}
          </Button>
        </div>
      </div>

      {!persisted && <p className="ui-muted">this collection has no stored view yet; add one from the tab strip to change its settings.</p>}

      <div className="collections-panel-grid">
        <label className="ui-label" htmlFor="collections-view-name">
          name
        </label>
        <Input id="collections-view-name" value={name} onChange={(event) => setName(event.target.value)} />

        <span className="ui-label">columns</span>
        <ul className="collections-panel-checks">
          {schema.map((property) => (
            <li key={property.id}>
              <label>
                <input
                  type="checkbox"
                  checked={config.visible.includes(property.id)}
                  disabled={property.type === "title"}
                  onChange={(event) => toggleVisible(property.id, event.target.checked)}
                />{" "}
                {property.name}
              </label>
            </li>
          ))}
        </ul>

        <label className="ui-label" htmlFor="collections-view-sort">
          sort
        </label>
        <div className="collections-panel-inline">
          <Select
            id="collections-view-sort"
            value={sort?.property ?? ""}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                sorts: event.target.value ? [{ property: event.target.value, direction: sort?.direction ?? "asc" }] : [],
              }))
            }
          >
            <option value="">none</option>
            {schema.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="sort direction"
            value={sort?.direction ?? "asc"}
            disabled={!sort}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                sorts: sort ? [{ property: sort.property, direction: event.target.value as "asc" | "desc" }] : [],
              }))
            }
          >
            <option value="asc">ascending</option>
            <option value="desc">descending</option>
          </Select>
        </div>

        <label className="ui-label" htmlFor="collections-view-group">
          group by
        </label>
        <Select
          id="collections-view-group"
          value={config.groupBy ?? ""}
          onChange={(event) =>
            setConfig((current) => {
              const next = { ...current };
              if (event.target.value) next.groupBy = event.target.value;
              else delete next.groupBy;
              return next;
            })
          }
        >
          <option value="">none</option>
          {groupable.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </Select>

        <span className="ui-label">default</span>
        <label>
          <input type="checkbox" checked={isDefault} disabled={view.isDefault} onChange={(event) => setIsDefault(event.target.checked)} /> open this
          view first
        </label>
      </div>

      {persisted && viewCount > 1 && (
        <div className="collections-panel-footer">
          {confirmDelete ? (
            <>
              <span className="ui-muted">delete this view?</span>
              <Button variant="danger" onClick={remove} disabled={saving}>
                confirm
              </Button>
              <Button onClick={() => setConfirmDelete(false)}>keep</Button>
            </>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              delete view
            </Button>
          )}
        </div>
      )}

      {error && <p className="ui-field-error">{error}</p>}
    </section>
  );
}
