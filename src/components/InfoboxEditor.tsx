"use client";

import { useMemo } from "react";
import { getInfoboxSchema, type InfoboxFieldDef } from "@/lib/infobox-schema";

type Category = { id: string; slug: string; parentId: string | null; children?: Category[] };

type Props = {
  categoryId: string;
  categories: Category[];
  data: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
};

/** Flatten a nested category tree into a flat array */
function flattenCategories(cats: Category[]): Category[] {
  const result: Category[] = [];
  function walk(list: Category[]) {
    for (const c of list) {
      result.push({ id: c.id, slug: c.slug, parentId: c.parentId });
      if (c.children) walk(c.children);
    }
  }
  walk(cats);
  return result;
}

export default function InfoboxEditor({ categoryId, categories, data, onChange }: Props) {
  const flat = useMemo(() => flattenCategories(categories), [categories]);

  const schema = useMemo(() => {
    const cat = flat.find((c) => c.id === categoryId);
    if (!cat) return null;
    return getInfoboxSchema(cat.slug, flat);
  }, [categoryId, flat]);

  if (!schema) {
    return (
      <p className="text-[12px] text-muted italic py-2">
        Select a category to see infobox fields.
      </p>
    );
  }

  function handleChange(key: string, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {schema.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={data[field.key] || ""}
          onChange={(val) => handleChange(field.key, val)}
        />
      ))}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: InfoboxFieldDef;
  value: string;
  onChange: (val: string) => void;
}) {
  const cls =
    "w-full border border-border bg-surface px-2 py-1 text-[13px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <label className="block text-[11px] text-muted mb-0.5">{field.label}</label>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          className={cls}
        />
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
