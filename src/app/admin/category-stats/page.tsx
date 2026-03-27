"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
  totalWords: number;
  avgWords: number;
  lastEdit: string | null;
};

type SortKey = "name" | "articleCount" | "totalWords" | "avgWords" | "lastEdit";

export default function CategoryStatsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("articleCount");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/admin/category-stats")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setRows(d); setLoading(false); });
  }, []);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSort(key);
      setDir("desc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const va = a[sort] ?? "";
    const vb = b[sort] ?? "";
    const cmp = typeof va === "number" ? va - (vb as number) : String(va).localeCompare(String(vb));
    return dir === "asc" ? cmp : -cmp;
  });

  const totalArticles = rows.reduce((s, r) => s + r.articleCount, 0);
  const totalWords = rows.reduce((s, r) => s + r.totalWords, 0);

  function fmt(n: number) {
    return n.toLocaleString();
  }

  // eslint-disable-next-line react-hooks/purity
  const nowMs = useRef(Date.now());

  function relDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    const diff = Math.floor((nowMs.current - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 30) return `${diff}d ago`;
    if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
    return `${Math.floor(diff / 365)}y ago`;
  }

  function Th({ label, k }: { label: string; k: SortKey }) {
    return (
      <th
        className="pb-1 pr-3 cursor-pointer hover:text-foreground select-none"
        onClick={() => toggleSort(k)}
      >
        {label}{sort === k ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </th>
    );
  }

  return (
    <div>
      <h1 className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
        Category Statistics
      </h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="wiki-portal">
          <div className="wiki-portal-header">Total articles</div>
          <div className="wiki-portal-body text-2xl font-bold text-heading">{fmt(totalArticles)}</div>
        </div>
        <div className="wiki-portal">
          <div className="wiki-portal-header">Total words</div>
          <div className="wiki-portal-body text-2xl font-bold text-heading">{fmt(totalWords)}</div>
        </div>
      </div>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : (
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-[11px] text-muted text-left border-b border-border">
              <Th label="Category" k="name" />
              <Th label="Articles" k="articleCount" />
              <Th label="Total words" k="totalWords" />
              <Th label="Avg words" k="avgWords" />
              <Th label="Last edit" k="lastEdit" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-t border-border-light hover:bg-surface-hover">
                <td className="py-1.5 pr-3 font-medium">
                  <Link href={`/categories/${r.slug}`} className="wiki-link hover:underline">{r.name}</Link>
                </td>
                <td className="py-1.5 pr-3">{r.articleCount}</td>
                <td className="py-1.5 pr-3">{fmt(r.totalWords)}</td>
                <td className="py-1.5 pr-3">{fmt(r.avgWords)}</td>
                <td className="py-1.5 pr-3 text-muted">{relDate(r.lastEdit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
