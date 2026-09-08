"use client";

import { ARTICLE_TEMPLATES, type ArticleTemplate } from "@/lib/templates";

type Props = {
  selected: string;
  onSelect: (template: ArticleTemplate) => void;
};

export default function TemplatePicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
      {ARTICLE_TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t)}
          className={`border p-2 text-center text-[12px] transition-colors ${
            selected === t.id
              ? "border-accent bg-accent-soft font-bold"
              : "border-border bg-surface-hover hover:border-accent"
          }`}
        >
          <div className="text-lg">{t.icon}</div>
          <div>{t.name}</div>
        </button>
      ))}
    </div>
  );
}
