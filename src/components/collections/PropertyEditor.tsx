"use client";

import clsx from "clsx";
import { useId, useRef, useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { Chip } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { PersonOption } from "@/modules/collections/model";
import type { PropertyDefinition, PropertyValue, SelectOption } from "@/modules/collections/properties";
import { rememberLabel, useLabel } from "./labels";

export type EditorContext = {
  users: PersonOption[];
  /** The collection this editor lives in; relation editors use it to resolve targets. */
  collectionId: string;
};

type EditorProps = {
  property: PropertyDefinition;
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
  context: EditorContext;
  /** In a 2.25rem table cell: borderless controls that fill the cell. */
  compact?: boolean;
  readOnly?: boolean;
  id?: string;
  autoFocus?: boolean;
};

const controlClass = (compact: boolean | undefined, kind: "input" | "select") =>
  compact ? clsx("collections-cell-control", kind === "select" && "collections-cell-select") : kind === "input" ? "ui-input" : "ui-select";

type DeferredInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onCommit: (value: string) => void;
};

/** A text input that reports its value on blur or enter and reverts on escape. */
export function DeferredInput({ value, onCommit, onKeyDown, ...props }: DeferredInputProps) {
  const [draft, setDraft] = useState(value);
  const commit = () => {
    if (draft !== value) onCommit(draft);
  };
  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      setDraft(value);
      event.currentTarget.blur();
    }
  };
  return <input {...props} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={handleKey} />;
}

/** A yyyy-mm-dd value is a calendar day, not an instant: format it in local time so it never shifts a day. */
function formatDay(day: string) {
  return formatDate(new Date(`${day}T00:00:00`));
}

function toneOf(options: SelectOption[], id: string | null) {
  return options.find((option) => option.id === id)?.tone ?? "default";
}

type SearchResult = { id: string; label: string };

type SearchPickerProps = {
  id?: string;
  value: string | null;
  label: string;
  placeholder: string;
  search: (query: string) => Promise<SearchResult[]>;
  onPick: (result: SearchResult | null) => void;
  compact?: boolean;
  autoFocus?: boolean;
};

/**
 * Search-as-you-type over a native datalist: no floating card of our own. Picking a
 * suggestion (or typing an exact label) commits; clearing the field clears the value.
 */
function SearchPicker({ id, value, label, placeholder, search, onPick, compact, autoFocus }: SearchPickerProps) {
  const listId = useId();
  const [query, setQuery] = useState(label);
  const [results, setResults] = useState<SearchResult[]>([]);
  const latest = useRef(0);

  // Keep the field in step when the resolved label arrives after mount.
  const [seenLabel, setSeenLabel] = useState(label);
  if (seenLabel !== label) {
    setSeenLabel(label);
    setQuery(label);
  }

  const runSearch = (text: string) => {
    const ticket = ++latest.current;
    if (!text.trim()) {
      setResults([]);
      return;
    }
    search(text).then((found) => {
      if (ticket === latest.current) setResults(found);
    });
  };

  const pickExact = (text: string) => {
    const match = results.find((result) => result.label === text);
    if (match) {
      onPick(match);
      return true;
    }
    return false;
  };

  return (
    <>
      <input
        id={id}
        list={listId}
        className={controlClass(compact, "input")}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        onChange={(event) => {
          const text = event.target.value;
          setQuery(text);
          if (!pickExact(text)) runSearch(text);
        }}
        onBlur={() => {
          if (!query.trim() && value) onPick(null);
          else if (query !== label && !pickExact(query)) setQuery(label);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!pickExact(query) && results[0]) onPick(results[0]);
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            setQuery(label);
            event.currentTarget.blur();
          }
        }}
      />
      <datalist id={listId}>
        {results.map((result) => (
          <option key={result.id} value={result.label} />
        ))}
      </datalist>
    </>
  );
}

async function searchPages(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: { id: string; title: string }[] };
    return (data.results ?? []).map((article) => ({ id: article.id, label: article.title }));
  } catch {
    return [];
  }
}

function searchItems(collectionId: string) {
  return async (query: string): Promise<SearchResult[]> => {
    try {
      const res = await fetch(`/api/collections/${encodeURIComponent(collectionId)}/items?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = (await res.json()) as { items?: { id: string; title: string }[] };
      return (data.items ?? []).slice(0, 8).map((item) => ({ id: item.id, label: item.title }));
    } catch {
      return [];
    }
  };
}

function PageEditor({ value, onChange, compact, readOnly, id, autoFocus }: Omit<EditorProps, "property" | "context">) {
  const articleId = typeof value === "string" ? value : null;
  const label = useLabel("page", articleId);
  if (readOnly) return articleId ? <span>{label}</span> : <span className="ui-muted">—</span>;
  return (
    <SearchPicker
      id={id}
      compact={compact}
      autoFocus={autoFocus}
      value={articleId}
      label={articleId ? label : ""}
      placeholder="search pages…"
      search={searchPages}
      onPick={(result) => {
        if (result) rememberLabel("page", result.id, result.label);
        onChange(result ? result.id : null);
      }}
    />
  );
}

function RelationChip({ collectionId, itemId, onRemove }: { collectionId: string; itemId: string; onRemove?: () => void }) {
  const label = useLabel(`item:${collectionId}`, itemId);
  return (
    <Chip>
      {label}
      {onRemove && (
        <button type="button" className="collections-chip-remove" aria-label={`remove ${label}`} onClick={onRemove}>
          ×
        </button>
      )}
    </Chip>
  );
}

function RelationEditor({ property, value, onChange, compact, readOnly, id }: EditorProps & { property: Extract<PropertyDefinition, { type: "relation" }> }) {
  const ids = Array.isArray(value) ? value : [];
  const kind = `item:${property.collectionId}` as const;
  return (
    <span className="collections-chips">
      {ids.map((itemId) => (
        <RelationChip
          key={itemId}
          collectionId={property.collectionId}
          itemId={itemId}
          onRemove={readOnly ? undefined : () => onChange(ids.filter((entry) => entry !== itemId))}
        />
      ))}
      {ids.length === 0 && readOnly && <span className="ui-muted">—</span>}
      {!readOnly && (
        <SearchPicker
          id={id}
          compact={compact}
          value={null}
          label=""
          placeholder="add…"
          search={searchItems(property.collectionId)}
          onPick={(result) => {
            if (!result || ids.includes(result.id)) return;
            rememberLabel(kind, result.id, result.label);
            onChange([...ids, result.id]);
          }}
        />
      )}
    </span>
  );
}

function MultiSelectEditor({ property, value, onChange, compact, readOnly, id }: EditorProps & { property: Extract<PropertyDefinition, { type: "multi_select" }> }) {
  const ids = Array.isArray(value) ? value : [];
  const remaining = property.options.filter((option) => !ids.includes(option.id));
  return (
    <span className="collections-chips">
      {ids.map((optionId) => {
        const option = property.options.find((entry) => entry.id === optionId);
        return (
          <Chip key={optionId} tone={option?.tone ?? "default"}>
            {option?.label ?? optionId}
            {!readOnly && (
              <button
                type="button"
                className="collections-chip-remove"
                aria-label={`remove ${option?.label ?? optionId}`}
                onClick={() => onChange(ids.filter((entry) => entry !== optionId))}
              >
                ×
              </button>
            )}
          </Chip>
        );
      })}
      {ids.length === 0 && readOnly && <span className="ui-muted">—</span>}
      {!readOnly && remaining.length > 0 && (
        <select
          id={id}
          className={clsx(controlClass(compact, "select"), "collections-chip-add")}
          value=""
          aria-label={`add ${property.name}`}
          onChange={(event) => {
            if (event.target.value) onChange([...ids, event.target.value]);
          }}
        >
          <option value="">add…</option>
          {remaining.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </span>
  );
}

/** One editor per property type; the same component serves table cells (`compact`) and the item form. */
export function PropertyEditor(props: EditorProps) {
  const { property, value, onChange, context, compact, readOnly, id, autoFocus } = props;
  const inputClass = controlClass(compact, "input");
  const selectClass = controlClass(compact, "select");

  switch (property.type) {
    case "title":
    case "text": {
      const text = typeof value === "string" ? value : "";
      if (readOnly) return text ? <span>{text}</span> : <span className="ui-muted">—</span>;
      return (
        <DeferredInput
          key={text}
          id={id}
          className={inputClass}
          value={text}
          autoFocus={autoFocus}
          placeholder={property.type === "title" ? "untitled" : ""}
          onCommit={(next) => onChange(next.trim() || (property.type === "title" ? text : null))}
        />
      );
    }
    case "number": {
      const number = typeof value === "number" ? String(value) : "";
      if (readOnly) return number ? <span>{number}</span> : <span className="ui-muted">—</span>;
      return (
        <DeferredInput
          key={number}
          id={id}
          type="number"
          step="any"
          inputMode="decimal"
          className={inputClass}
          value={number}
          autoFocus={autoFocus}
          onCommit={(next) => {
            const parsed = Number.parseFloat(next);
            onChange(next.trim() === "" || Number.isNaN(parsed) ? null : parsed);
          }}
        />
      );
    }
    case "url": {
      const url = typeof value === "string" ? value : "";
      if (readOnly) {
        return url ? (
          <a href={url} target="_blank" rel="noreferrer noopener">
            {url}
          </a>
        ) : (
          <span className="ui-muted">—</span>
        );
      }
      return (
        <DeferredInput
          key={url}
          id={id}
          type="url"
          className={inputClass}
          value={url}
          autoFocus={autoFocus}
          placeholder="https://"
          onCommit={(next) => onChange(next.trim() || null)}
        />
      );
    }
    case "date": {
      const date = typeof value === "string" ? value : "";
      if (readOnly) return date ? <span>{formatDay(date)}</span> : <span className="ui-muted">—</span>;
      return (
        <input
          id={id}
          type="date"
          className={inputClass}
          value={date}
          autoFocus={autoFocus}
          onChange={(event) => onChange(event.target.value || null)}
        />
      );
    }
    case "checkbox": {
      const checked = value === true;
      return (
        <input
          id={id}
          type="checkbox"
          className="collections-checkbox"
          checked={checked}
          disabled={readOnly}
          aria-label={property.name}
          onChange={(event) => onChange(event.target.checked)}
        />
      );
    }
    case "select": {
      const selected = typeof value === "string" ? value : "";
      const option = property.options.find((entry) => entry.id === selected);
      if (readOnly) return option ? <Chip tone={option.tone}>{option.label}</Chip> : <span className="ui-muted">—</span>;
      return (
        <select
          id={id}
          className={clsx(selectClass, `collections-tone-${toneOf(property.options, selected || null)}`)}
          value={selected}
          autoFocus={autoFocus}
          onChange={(event) => onChange(event.target.value || null)}
        >
          <option value="">—</option>
          {property.options.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
      );
    }
    case "multi_select":
      return <MultiSelectEditor {...props} property={property} />;
    case "person": {
      const selected = typeof value === "string" ? value : "";
      const person = context.users.find((user) => user.id === selected);
      if (readOnly) return person ? <span>{person.label}</span> : selected ? <span className="ui-muted">{selected}</span> : <span className="ui-muted">—</span>;
      return (
        <select id={id} className={selectClass} value={selected} autoFocus={autoFocus} onChange={(event) => onChange(event.target.value || null)}>
          <option value="">—</option>
          {selected && !person && <option value={selected}>{selected}</option>}
          {context.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.label}
            </option>
          ))}
        </select>
      );
    }
    case "page":
      return <PageEditor value={value} onChange={onChange} compact={compact} readOnly={readOnly} id={id} autoFocus={autoFocus} />;
    case "relation":
      return <RelationEditor {...props} property={property} />;
    case "created_time":
    case "updated_time": {
      const stamp = typeof value === "string" ? value : "";
      return <span className="ui-muted">{stamp ? formatDate(stamp) : "—"}</span>;
    }
  }
}
