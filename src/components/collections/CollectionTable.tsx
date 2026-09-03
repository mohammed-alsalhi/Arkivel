"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import clsx from "clsx";
import { Button, DataTable, EmptyState, TabButton, Tabs } from "@/components/ui";
import type { CollectionDTO, ItemDTO, ItemPage, PersonOption, ViewDTO } from "@/modules/collections/model";
import { applyView, propertyValue, titleProperty, type PropertyDefinition, type PropertySchema, type PropertyValue } from "@/modules/collections/properties";
import { api, describeFailure } from "./api";
import { PropertiesPanel } from "./PropertiesPanel";
import { PropertyEditor } from "./PropertyEditor";
import { ViewSettingsPanel } from "./ViewSettingsPanel";

type Props = {
  collection: CollectionDTO;
  view: ViewDTO;
  page: ItemPage;
  users: PersonOption[];
  canEdit: boolean;
};

type Status = { tone: "muted" | "error"; text: string } | null;

function viewHref(slug: string, view: ViewDTO) {
  return view.isDefault ? `/collections/${encodeURIComponent(slug)}` : `/collections/${encodeURIComponent(slug)}/${encodeURIComponent(view.slug)}`;
}

function itemHref(slug: string, itemId: string) {
  return `/collections/${encodeURIComponent(slug)}/items/${encodeURIComponent(itemId)}`;
}

const COLUMN_WIDTHS: Partial<Record<PropertyDefinition["type"], string>> = {
  checkbox: "4.5rem",
  number: "7rem",
  date: "9.5rem",
  select: "10rem",
  person: "10rem",
  created_time: "9rem",
  updated_time: "9rem",
};

/** The table view: the shared DataTable look with one editable column per visible property. */
export function CollectionTable({ collection, view: initialView, page, users, canEdit }: Props) {
  const router = useRouter();
  const [schema, setSchema] = useState<PropertySchema>(collection.schema);
  const [views, setViews] = useState<ViewDTO[]>(collection.views);
  const [view, setView] = useState<ViewDTO>(initialView);
  const [items, setItems] = useState<ItemDTO[]>(page.items);
  const [total, setTotal] = useState(page.total);
  const [hasMore, setHasMore] = useState(page.hasMore);
  const [nextPage, setNextPage] = useState(page.page + 1);
  const [panel, setPanel] = useState<"properties" | "view" | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const newTitleRef = useRef<HTMLInputElement>(null);

  const context = { users, collectionId: collection.id };
  const base = `/api/collections/${encodeURIComponent(collection.id)}`;
  const title = titleProperty(schema);
  const result = applyView(items, view.config, schema);
  const columns = [...(title ? [title] : []), ...result.columns.filter((property) => property.type !== "title")];
  const columnCount = columns.length + (canEdit ? 1 : 0);

  const replaceItem = (id: string, next: ItemDTO | ((current: ItemDTO) => ItemDTO)) =>
    setItems((current) => current.map((item) => (item.id === id ? (typeof next === "function" ? next(item) : next) : item)));

  const commit = async (item: ItemDTO, property: PropertyDefinition, value: PropertyValue) => {
    const previous = item;
    const optimistic: ItemDTO =
      property.type === "title" ? { ...item, title: String(value ?? "") } : { ...item, properties: { ...item.properties, [property.id]: value } };
    replaceItem(item.id, optimistic);
    setStatus({ tone: "muted", text: "saving…" });
    const body = property.type === "title" ? { title: value } : { properties: { [property.id]: value } };
    const response = await api<ItemDTO>(`${base}/items/${encodeURIComponent(item.id)}`, { method: "PATCH", body });
    if (response.ok) {
      replaceItem(item.id, response.data);
      setStatus(null);
    } else {
      replaceItem(item.id, previous);
      setStatus({ tone: "error", text: `couldn't save ${property.name}: ${describeFailure(response)}` });
    }
  };

  const create = async () => {
    const text = newTitle.trim();
    if (!text || creating) return;
    setCreating(true);
    const response = await api<ItemDTO>(`${base}/items`, { method: "POST", body: { title: text } });
    setCreating(false);
    if (response.ok) {
      setItems((current) => [...current, response.data]);
      setTotal((count) => count + 1);
      setNewTitle("");
      setStatus(null);
      newTitleRef.current?.focus();
    } else {
      setStatus({ tone: "error", text: `couldn't add item: ${describeFailure(response)}` });
    }
  };

  const remove = async (item: ItemDTO) => {
    const response = await api(`${base}/items/${encodeURIComponent(item.id)}`, { method: "DELETE" });
    setPendingDelete(null);
    if (response.ok) {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setTotal((count) => Math.max(0, count - 1));
    } else {
      setStatus({ tone: "error", text: `couldn't delete: ${describeFailure(response)}` });
    }
  };

  const loadMore = async () => {
    const response = await api<ItemPage>(`${base}/items?page=${nextPage}`);
    if (!response.ok) {
      setStatus({ tone: "error", text: describeFailure(response) });
      return;
    }
    setItems((current) => {
      const known = new Set(current.map((item) => item.id));
      return [...current, ...response.data.items.filter((item) => !known.has(item.id))];
    });
    setTotal(response.data.total);
    setHasMore(response.data.hasMore);
    setNextPage(response.data.page + 1);
  };

  const addView = async () => {
    const response = await api<ViewDTO>(`${base}/views`, { method: "POST", body: { name: `view ${views.length + 1}` } });
    if (!response.ok) {
      setStatus({ tone: "error", text: describeFailure(response) });
      return;
    }
    router.push(viewHref(collection.slug, response.data));
  };

  const onSchemaSaved = async (next: PropertySchema) => {
    const known = new Set(schema.map((property) => property.id));
    const added = next.filter((property) => !known.has(property.id)).map((property) => property.id);
    setSchema(next);
    setPanel(null);
    if (added.length && view.id) {
      const config = { ...view.config, visible: [...view.config.visible, ...added] };
      const response = await api<ViewDTO>(`${base}/views/${encodeURIComponent(view.id)}`, { method: "PATCH", body: { config } });
      if (response.ok) {
        setView(response.data);
        setViews((current) => current.map((entry) => (entry.id === response.data.id ? response.data : entry)));
      }
    } else if (added.length) {
      setView((current) => ({ ...current, config: { ...current.config, visible: [...current.config.visible, ...added] } }));
    }
    router.refresh();
  };

  const onViewSaved = (next: ViewDTO) => {
    setView(next);
    setViews((current) => current.map((entry) => (entry.id === next.id ? next : next.isDefault ? { ...entry, isDefault: false } : entry)));
    setPanel(null);
    router.refresh();
  };

  const renderRow = (item: ItemDTO) => (
    <tr key={item.id}>
      {columns.map((property) => {
        const value = propertyValue(item, property);
        return (
          <td key={property.id} className={clsx("collections-cell", `collections-cell-${property.type}`)}>
            {property.type === "title" && !canEdit ? (
              <Link href={itemHref(collection.slug, item.id)} className="font-medium">
                {item.title}
              </Link>
            ) : (
              <PropertyEditor
                property={property}
                value={value}
                onChange={(next) => commit(item, property, next)}
                context={context}
                compact
                readOnly={!canEdit}
              />
            )}
          </td>
        );
      })}
      {canEdit && (
        <td className="collections-cell collections-cell-actions">
          <div className="collections-row-actions">
            {pendingDelete === item.id ? (
              <>
                <Button variant="danger" onClick={() => remove(item)}>
                  confirm
                </Button>
                <Button onClick={() => setPendingDelete(null)}>keep</Button>
              </>
            ) : (
              <>
                <Link href={itemHref(collection.slug, item.id)} className="ui-button">
                  open
                </Link>
                <Button variant="danger" onClick={() => setPendingDelete(item.id)}>
                  delete
                </Button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="collections-view">
      <div className="collections-toolbar">
        <Tabs label="views">
          {views.map((entry) => (
            <TabButton key={entry.id} active={entry.id === view.id} onClick={() => router.push(viewHref(collection.slug, entry))}>
              {entry.name}
            </TabButton>
          ))}
          {views.length === 0 && <TabButton active>{view.name}</TabButton>}
        </Tabs>
        <div className="collections-toolbar-actions">
          {canEdit && (
            <Button
              onClick={() => {
                newTitleRef.current?.focus();
                newTitleRef.current?.scrollIntoView({ block: "nearest" });
              }}
            >
              new item
            </Button>
          )}
          {canEdit && <Button onClick={addView}>new view</Button>}
          {canEdit && (
            <Button aria-pressed={panel === "properties"} onClick={() => setPanel(panel === "properties" ? null : "properties")}>
              properties
            </Button>
          )}
          <Button aria-pressed={panel === "view"} onClick={() => setPanel(panel === "view" ? null : "view")}>
            view settings
          </Button>
        </div>
      </div>

      {panel === "properties" && canEdit && (
        <PropertiesPanel collectionId={collection.id} schema={schema} onSaved={onSchemaSaved} onClose={() => setPanel(null)} />
      )}
      {panel === "view" && (
        canEdit ? (
          <ViewSettingsPanel
            collectionId={collection.id}
            schema={schema}
            view={view}
            viewCount={views.length}
            onSaved={onViewSaved}
            onDeleted={() => router.push(`/collections/${encodeURIComponent(collection.slug)}`)}
            onClose={() => setPanel(null)}
          />
        ) : (
          <section className="collections-panel" aria-label="view settings">
            <p className="ui-muted">
              showing {result.items.length} of {total} item{total === 1 ? "" : "s"}
              {view.config.sorts[0] ? ` · sorted by ${schema.find((property) => property.id === view.config.sorts[0].property)?.name ?? ""}` : ""}
              {view.config.groupBy ? ` · grouped by ${schema.find((property) => property.id === view.config.groupBy)?.name ?? ""}` : ""}
            </p>
          </section>
        )
      )}

      {items.length === 0 && !canEdit ? (
        <EmptyState title="no items yet" />
      ) : (
        <DataTable className="collections-table">
          <colgroup>
            {columns.map((property) => (
              <col key={property.id} style={property.type === "title" ? { width: "28%" } : COLUMN_WIDTHS[property.type] ? { width: COLUMN_WIDTHS[property.type] } : undefined} />
            ))}
            {canEdit && <col style={{ width: "8.5rem" }} />}
          </colgroup>
          <thead>
            <tr>
              {columns.map((property) => (
                <th key={property.id} scope="col">
                  {property.name}
                </th>
              ))}
              {canEdit && <th scope="col">actions</th>}
            </tr>
          </thead>
          <tbody>
            {result.groups
              ? result.groups.map((group) => (
                  <GroupRows key={group.key ?? "__none"} label={group.label} count={group.items.length} columnCount={columnCount}>
                    {group.items.map(renderRow)}
                  </GroupRows>
                ))
              : result.items.map(renderRow)}
            {items.length > 0 && result.items.length === 0 && (
              <tr>
                <td colSpan={columnCount} className="ui-muted">
                  no items match this view.
                </td>
              </tr>
            )}
            {canEdit && (
              <tr className="collections-new-row">
                <td colSpan={columnCount}>
                  <input
                    ref={newTitleRef}
                    className="collections-cell-control"
                    placeholder="new item…"
                    aria-label="new item title"
                    value={newTitle}
                    disabled={creating}
                    onChange={(event) => setNewTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        create();
                      } else if (event.key === "Escape") {
                        setNewTitle("");
                        event.currentTarget.blur();
                      }
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </DataTable>
      )}

      <div className="collections-status-row">
        <p className={clsx("collections-status", status?.tone === "error" && "collections-status-error")} aria-live="polite">
          {status?.text ?? `${total} item${total === 1 ? "" : "s"}`}
        </p>
        {hasMore && <Button onClick={loadMore}>load more</Button>}
      </div>
    </div>
  );
}

function GroupRows({ label, count, columnCount, children }: { label: string; count: number; columnCount: number; children: React.ReactNode }) {
  return (
    <>
      <tr className="collections-group-row">
        <td colSpan={columnCount}>
          {label} · {count}
        </td>
      </tr>
      {children}
    </>
  );
}
