import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { DeferredInput } from "./PropertyEditor";
import { calendarDay, calendarDays } from "./CollectionCalendar";
import { fetchLabel } from "./labels";
import { ItemForm } from "./ItemForm";
import type { CollectionDTO, ItemDTO } from "@/modules/collections/model";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

it("commits Enter once and cancels Escape without saving a stale draft", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const commit = vi.fn();
  const setValue = (input: HTMLInputElement, value: string) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
  try {
    await act(async () => root.render(<DeferredInput value="original" onCommit={commit} />));
    const input = container.querySelector("input")!;
    await act(async () => {
      input.focus();
      setValue(input, "saved");
    });
    await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    expect(commit).toHaveBeenCalledExactlyOnceWith("saved");
    commit.mockClear();
    await act(async () => {
      input.focus();
      setValue(input, "cancelled");
    });
    await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(commit).not.toHaveBeenCalled();
    expect(input.value).toBe("original");
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});

describe("calendar dates", () => {
  it("uses whole weeks and keeps leap day and December boundaries", () => {
    const february = calendarDays("2028-02");
    expect(february.length % 7).toBe(0);
    expect(february[0].getDay()).toBe(0);
    expect(february.map(calendarDay)).toContain("2028-02-29");
    const december = calendarDays("2026-12").map(calendarDay);
    expect(december[0]).toBe("2026-11-29");
    expect(december.at(-1)).toBe("2027-01-02");
  });
});

it("does not cache a failed relation lookup as an opaque storage id", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ title: "CS225" }) });
  vi.stubGlobal("fetch", fetchMock);
  try {
    expect(await fetchLabel("item:test-courses", "test-retry-course")).toBe("");
    expect(await fetchLabel("item:test-courses", "test-retry-course")).toBe("CS225");
    expect(await fetchLabel("item:test-courses", "test-retry-course")).toBe("CS225");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  } finally {
    vi.unstubAllGlobals();
  }
});

it("editing notes in a stale form preserves metadata changed by a course import", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const item: ItemDTO = {
    id: "assignment",
    collectionId: "coursework",
    articleId: null,
    article: null,
    title: "Old assignment title",
    properties: { notes: "", source_status: "open" },
    sortOrder: 0,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  };
  const collection: CollectionDTO = {
    id: "coursework",
    slug: "coursework",
    name: "Coursework",
    icon: null,
    description: null,
    category: null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    views: [],
    schema: [
      { id: "title", name: "title", type: "title" },
      { id: "notes", name: "notes", type: "text" },
      { id: "source_status", name: "source status", type: "text" },
    ],
  };
  const imported = { ...item, title: "Updated assignment title", properties: { ...item.properties, source_status: "completed" } };
  const fetchMock = vi.fn(async (_url: string, request: RequestInit) => {
    const patch = JSON.parse(String(request.body));
    return { ok: true, json: async () => ({ ...imported, ...patch, properties: { ...imported.properties, ...patch.properties } }) };
  });
  vi.stubGlobal("fetch", fetchMock);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<ItemForm collection={collection} item={item} users={[]} canEdit />));
    const notes = container.querySelector<HTMLInputElement>("#prop-notes")!;
    await act(async () => {
      notes.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(notes, "Review chapter 2");
      notes.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const save = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "save")!;
    expect(document.activeElement).toBe(notes);
    expect(save.disabled).toBe(false);
    expect(container.textContent).toContain("unsaved changes");
    await act(async () => save.click());
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({ properties: { notes: "Review chapter 2" } });
    expect(container.querySelector<HTMLInputElement>("#prop-title")!.value).toBe("Updated assignment title");
    expect(container.querySelector<HTMLInputElement>("#prop-source_status")!.value).toBe("completed");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});
