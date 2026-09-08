import type { PropertySchema, ViewConfig } from "./properties";
import { defaultViewFor } from "./properties";

export type TemplateId = "blank" | "tasks" | "reading_list" | "simple_table" | "courses" | "coursework";

export type CollectionTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  schema: PropertySchema;
  views: { name: string; slug: string; kind: "table"; config: ViewConfig; isDefault: boolean }[];
};

function tableView(schema: PropertySchema, config?: Partial<ViewConfig>): CollectionTemplate["views"] {
  return [{ name: "table", slug: "table", kind: "table", isDefault: true, config: { ...defaultViewFor(schema), ...config } }];
}

const tasksSchema: PropertySchema = [
  { id: "title", name: "task", type: "title" },
  {
    id: "status",
    name: "status",
    type: "select",
    options: [
      { id: "todo", label: "todo", tone: "default" },
      { id: "in_progress", label: "in progress", tone: "info" },
      { id: "done", label: "done", tone: "success" },
    ],
  },
  { id: "due", name: "due", type: "date" },
  {
    id: "priority",
    name: "priority",
    type: "select",
    options: [
      { id: "low", label: "low", tone: "default" },
      { id: "medium", label: "medium", tone: "warning" },
      { id: "high", label: "high", tone: "danger" },
    ],
  },
  { id: "assignee", name: "assignee", type: "person" },
  { id: "notes", name: "notes", type: "text" },
];

const readingListSchema: PropertySchema = [
  { id: "title", name: "title", type: "title" },
  {
    id: "status",
    name: "status",
    type: "select",
    options: [
      { id: "to_read", label: "to read", tone: "default" },
      { id: "reading", label: "reading", tone: "info" },
      { id: "read", label: "read", tone: "success" },
    ],
  },
  { id: "url", name: "url", type: "url" },
  { id: "author", name: "author", type: "text" },
  { id: "rating", name: "rating", type: "number" },
];

const simpleTableSchema: PropertySchema = [
  { id: "title", name: "name", type: "title" },
  { id: "text", name: "text", type: "text" },
  { id: "number", name: "number", type: "number" },
  { id: "done", name: "done", type: "checkbox" },
];

const blankSchema: PropertySchema = [{ id: "title", name: "name", type: "title" }];

const coursesSchema: PropertySchema = [
  { id: "title", name: "course", type: "title" },
  { id: "code", name: "code", type: "text" },
  { id: "term", name: "term", type: "text" },
  { id: "source_url", name: "course website", type: "url" },
  { id: "source_id", name: "source id", type: "text" },
  { id: "notes", name: "notes", type: "text" },
];

const courseworkSchema: PropertySchema = [
  ...tasksSchema.filter((property) => property.id !== "assignee"),
  // The course workspace kit binds this property to its courses collection.
  { id: "course", name: "course", type: "text" },
  { id: "kind", name: "kind", type: "select", options: [
    { id: "assignment", label: "assignment", tone: "default" },
    { id: "exam", label: "exam", tone: "danger" },
    { id: "reading", label: "reading", tone: "info" },
    { id: "action", label: "action", tone: "warning" },
  ] },
  { id: "due_at", name: "exact deadline", type: "text" },
  { id: "timezone", name: "timezone", type: "text" },
  { id: "available_at", name: "available from", type: "text" },
  { id: "late_until", name: "late deadline", type: "text" },
  { id: "reservation_at", name: "confirmed reservation", type: "text" },
  { id: "score", name: "score", type: "number" },
  { id: "completion_evidence", name: "completion evidence", type: "text" },
  { id: "source_id", name: "source id", type: "text" },
  { id: "source_url", name: "source", type: "url" },
  { id: "source_list", name: "source list", type: "text" },
  { id: "source_status", name: "source status", type: "select", options: [
    { id: "needsAction", label: "open", tone: "default" },
    { id: "completed", label: "completed", tone: "success" },
    { id: "unknown", label: "unknown", tone: "warning" },
  ] },
  { id: "source_updated", name: "source captured at", type: "text" },
  { id: "source_notes", name: "source notes", type: "text" },
];

export const COLLECTION_TEMPLATES: readonly CollectionTemplate[] = [
  { id: "courses", name: "courses", description: "course hubs, term, source links, and notes.", schema: coursesSchema,
    views: tableView(coursesSchema, { visible: ["title", "code", "term", "source_url"] }) },
  { id: "coursework", name: "coursework", description: "course tasks with deadlines, completion evidence, and import provenance.", schema: courseworkSchema,
    views: tableView(courseworkSchema, { visible: ["title", "status", "course", "due", "priority", "kind", "source_url"], sorts: [{ property: "due", direction: "asc" }] }) },
  { id: "blank", name: "blank", description: "a title column; add properties as you go.", schema: blankSchema, views: tableView(blankSchema) },
  {
    id: "tasks",
    name: "tasks",
    description: "status, due date, priority, assignee, notes.",
    schema: tasksSchema,
    views: tableView(tasksSchema, { sorts: [{ property: "due", direction: "asc" }] }),
  },
  {
    id: "reading_list",
    name: "reading list",
    description: "status, link, author, rating.",
    schema: readingListSchema,
    views: tableView(readingListSchema),
  },
  {
    id: "simple_table",
    name: "simple table",
    description: "a text, a number, and a checkbox.",
    schema: simpleTableSchema,
    views: tableView(simpleTableSchema),
  },
];

export function getTemplate(id: unknown): CollectionTemplate | undefined {
  return COLLECTION_TEMPLATES.find((template) => template.id === id);
}
