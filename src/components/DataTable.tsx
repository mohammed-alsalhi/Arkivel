"use client";

import { useMemo, useState } from "react";

interface Props {
  source: string;
  sourceType?: "csv" | "json";
}

function parseCSV(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parse = (line: string) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const headers = parse(lines[0]);
  const rows = lines.slice(1).map(parse);
  return { headers, rows };
}

function parseJSON(json: string): { headers: string[]; rows: string[][] } {
  try {
    const data = JSON.parse(json);
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return { headers: [], rows: [] };
    const headers = Object.keys(arr[0]);
    const rows = arr.map((item) => headers.map((h) => String(item[h] ?? "")));
    return { headers, rows };
  } catch {
    return { headers: ["Error"], rows: [["Invalid JSON"]] };
  }
}

export default function DataTable({ source, sourceType = "csv" }: Props) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState("");

  const { headers, rows } = useMemo(() => {
    return sourceType === "json" ? parseJSON(source) : parseCSV(source);
  }, [source, sourceType]);

  const filtered = useMemo(() => {
    if (!filter) return rows;
    const q = filter.toLowerCase();
    return rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
  }, [rows, filter]);

  const sorted = useMemo(() => {
    if (sortCol === null) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] || "";
      const bv = b[sortCol] || "";
      const num = (s: string) => !isNaN(Number(s)) ? Number(s) : null;
      const an = num(av); const bn = num(bv);
      if (an !== null && bn !== null) return sortAsc ? an - bn : bn - an;
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortCol, sortAsc]);

  function toggleSort(i: number) {
    if (sortCol === i) setSortAsc((a) => !a);
    else { setSortCol(i); setSortAsc(true); }
  }

  function downloadCSV() {
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "data.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="my-4 border border-border rounded overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-surface-hover border-b border-border">
        <input
          type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter…"
          className="min-w-0 flex-1 text-sm border border-border rounded px-2 py-0.5 bg-surface sm:flex-none sm:w-48"
        />
        <button onClick={downloadCSV} className="text-xs text-muted hover:text-foreground">↓ CSV</button>
      </div>
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              {headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => toggleSort(i)}
                  className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-surface text-xs"
                >
                  {h} {sortCol === i ? (sortAsc ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, ri) => (
              <tr key={ri} className="border-b border-border hover:bg-surface-hover">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-xs">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="px-3 py-4 text-center text-muted text-sm">No matching rows</div>
        )}
      </div>
      <div className="px-3 py-1 text-[10px] text-muted border-t border-border">
        {sorted.length} / {rows.length} rows
      </div>
    </div>
  );
}
