"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  articleId: string;
  articleSlug: string;
}

export default function ArticleExportMenu({ articleId, articleSlug }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function exportAs(format: string) {
    setOpen(false);
    if (format === "epub") {
      window.location.href = `/api/export/epub?id=${articleId}`;
    } else if (format === "docx") {
      window.location.href = `/api/export/docx?id=${articleId}`;
    } else if (format === "pdf") {
      window.print();
    } else if (format === "html") {
      window.location.href = `/api/articles/${articleId}?format=html`;
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs px-2 py-1 border border-border rounded hover:bg-surface-hover"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Export ▾
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded shadow-lg min-w-[140px]">
          {[
            { label: "ePub", format: "epub" },
            { label: "Word (.docx)", format: "docx" },
            { label: "PDF (print)", format: "pdf" },
          ].map(({ label, format }) => (
            <button
              key={format}
              onClick={() => exportAs(format)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-surface-hover"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
