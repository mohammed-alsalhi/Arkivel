"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import type { ViewDTO } from "@/modules/collections/model";
import { VIEW_KINDS, type Filter, type PropertySchema, type ViewConfig, type ViewKind } from "@/modules/collections/properties";
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
  const [kind, setKind] = useState(view.kind);
  const [config, setConfig] = useState<ViewConfig>(view.config);
  const [isDefault, setIsDefault] = useState(view.isDefault);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const sort = config.sorts[0];
  const groupable = schema.filter((property) =>
    kind === "calendar"
      ? property.type === "date"
      : kind === "board"
        ? property.type === "select"
        : property.type === "select" || property.type === "person" || property.type === "checkbox",
  );
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
      body: { name, kind, config, ...(isDefault && !view.isDefault ? { isDefault: true } : {}) },
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
    const result = await api(`/api/collections/${encodeURIComponent(collectionId)}/views/${encodeURIComponent(view.id)}`, {
      method: "DELETE",
    });
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
        <h2 className="ui-section-title">view settings</h2>
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

        <label className="ui-label" htmlFor="collections-view-kind">
          layout
        </label>
        <Select
          id="collections-view-kind"
          value={kind}
          onChange={(event) => {
            const next = event.target.value as ViewKind;
            setKind(next);
            const group = schema.find((property) => property.type === (next === "calendar" ? "date" : "select"));
            setConfig((current) => ({ ...current, groupBy: next === "calendar" || next === "board" ? group?.id : undefined }));
          }}
        >
          {VIEW_KINDS.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </Select>

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
          {kind === "calendar" ? "date property" : "group by"}
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
          <input type="checkbox" checked={isDefault} disabled={view.isDefault} onChange={(event) => setIsDefault(event.target.checked)} />{" "}
          open this view first
        </label>
      </div>

      <div className="collections-view-filters">
        <div className="collections-panel-header">
          <h3>
            Filters <span className="ui-muted">match all conditions</span>
          </h3>
          <Button
            onClick={() =>
              setConfig((current) => ({ ...current, filters: [...current.filters, { property: schema[0].id, op: "not_empty" }] }))
            }
          >
            add filter
          </Button>
        </div>
        {config.filters.length === 0 && <p className="ui-muted">All items are included in this view.</p>}
        {config.filters.map((filter, index) => {
          const property = schema.find((entry) => entry.id === filter.property);
          const update = (patch: Partial<Filter>) =>
            setConfig((current) => ({
              ...current,
              filters: current.filters.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)),
            }));
          return (
            <div className="collections-filter-row" key={index}>
              <Select
                aria-label={`filter ${index + 1} property`}
                value={filter.property}
                onChange={(event) => update({ property: event.target.value, value: undefined, op: "not_empty" })}
              >
                {schema.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </Select>
              <Select
                aria-label={`filter ${index + 1} condition`}
                value={filter.op}
                onChange={(event) => update({ op: event.target.value as Filter["op"] })}
              >
                {[
                  ["eq", "is"],
                  ["neq", "is not"],
                  ["contains", "contains"],
                  ["empty", "is empty"],
                  ["not_empty", "is not empty"],
                  ["gt", "is after / greater than"],
                  ["lt", "is before / less than"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              {!["empty", "not_empty"].includes(filter.op) &&
                (property?.type === "select" ? (
                  <Select
                    aria-label={`filter ${index + 1} value`}
                    value={String(filter.value ?? "")}
                    onChange={(event) => update({ value: event.target.value })}
                  >
                    <option value="">choose value</option>
                    {property.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                ) : property?.type === "checkbox" ? (
                  <Select
                    aria-label={`filter ${index + 1} value`}
                    value={String(filter.value ?? "")}
                    onChange={(event) => update({ value: event.target.value === "true" })}
                  >
                    <option value="">choose value</option>
                    <option value="true">checked</option>
                    <option value="false">unchecked</option>
                  </Select>
                ) : (
                  <Input
                    aria-label={`filter ${index + 1} value`}
                    type={property?.type === "number" ? "number" : property?.type === "date" ? "date" : "text"}
                    value={String(filter.value ?? "")}
                    onChange={(event) =>
                      update({
                        value:
                          property?.type === "number"
                            ? event.target.value === ""
                              ? null
                              : Number(event.target.value)
                            : event.target.value,
                      })
                    }
                  />
                ))}
              <Button
                aria-label={`remove filter ${index + 1}`}
                onClick={() =>
                  setConfig((current) => ({ ...current, filters: current.filters.filter((_, position) => position !== index) }))
                }
              >
                remove
              </Button>
            </div>
          );
        })}
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

      {error && (
        <p className="ui-field-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
