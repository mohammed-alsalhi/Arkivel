"use client";

import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Category[];
};

type Props = {
  value: string;
  onChange: (id: string) => void;
  categories?: Category[];
};

export type { Category as CategoryOption };

export default function CategorySelect({ value, onChange, categories: externalCategories }: Props) {
  const [fetched, setFetched] = useState<Category[]>([]);

  useEffect(() => {
    if (externalCategories) return;
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setFetched);
  }, [externalCategories]);

  const categories = externalCategories || fetched;

  // Build root-only tree (API may return all or just roots)
  const roots = categories.filter((c) => !c.parentId);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-border bg-surface px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none"
    >
      <option value="">No category</option>
      {renderOptions(roots, 0)}
    </select>
  );
}

function renderOptions(categories: Category[], depth: number): React.ReactNode[] {
  return categories.flatMap((cat) => [
    <option key={cat.id} value={cat.id}>
      {"\u00A0".repeat(depth * 4)}{depth > 0 ? "\u2514 " : ""}{cat.name}
    </option>,
    ...(cat.children ? renderOptions(cat.children, depth + 1) : []),
  ]);
}
