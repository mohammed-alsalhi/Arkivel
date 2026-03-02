"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminContext";

type ImportResult = {
  filename: string;
  success: boolean;
  title?: string;
  slug?: string;
  error?: string;
};

const ACCEPTED = ".md,.markdown,.txt,.text,.html,.htm,.json,.xml";

export default function ImportPage() {
  const isAdmin = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isAdmin) {
    return (
      <div>
        <h1
          className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Import Articles
        </h1>
        <div className="wiki-notice">
          You must be{" "}
          <Link href="/admin">logged in as admin</Link> to import articles.
        </div>
      </div>
    );
  }

  function addFiles(newFiles: FileList | File[]) {
    const arr = Array.from(newFiles).filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ["md", "markdown", "txt", "text", "html", "htm", "json", "xml"].includes(
        ext || ""
      );
    });
    setFiles((prev) => [...prev, ...arr]);
    setResults(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatBadge(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const map: Record<string, string> = {
      md: "MD",
      markdown: "MD",
      txt: "TXT",
      text: "TXT",
      html: "HTML",
      htm: "HTML",
      json: "JSON",
      xml: "XML",
    };
    return map[ext] || ext.toUpperCase();
  }

  async function handleImport() {
    setImporting(true);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/articles/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResults(data.results);
      setFiles([]);
    } catch {
      setResults([
        { filename: "upload", success: false, error: "Network error" },
      ]);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Import Articles
      </h1>

      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Upload Files</div>
        <div className="wiki-portal-body">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-accent bg-accent/5"
                : "border-border hover:border-muted"
            }`}
          >
            <p className="text-[14px] text-foreground mb-1">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-[12px] text-muted">
              Supported: Markdown (.md), Text (.txt), HTML (.html), JSON (.json), MediaWiki XML (.xml)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-3">
              <div className="text-[12px] text-muted mb-1">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </div>
              <ul className="divide-y divide-border border border-border text-[13px]">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between px-3 py-1.5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block bg-surface-hover border border-border px-1.5 py-0.5 text-[10px] font-mono">
                        {formatBadge(file.name)}
                      </span>
                      <span>{file.name}</span>
                      <span className="text-muted text-[11px]">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-muted hover:text-foreground text-[12px]"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="border border-border bg-surface-hover px-4 py-1.5 text-[13px] font-medium hover:bg-surface transition-colors disabled:opacity-50"
                >
                  {importing ? "Importing..." : `Import ${files.length} file${files.length !== 1 ? "s" : ""}`}
                </button>
                <button
                  onClick={() => setFiles([])}
                  className="border border-border px-4 py-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="wiki-portal">
          <div className="wiki-portal-header">
            Import Results
          </div>
          <div className="wiki-portal-body p-0">
            <ul className="divide-y divide-border text-[13px]">
              {results.map((result, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-3 py-1.5"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        result.success ? "text-green-600" : "text-red-600"
                      }
                    >
                      {result.success ? "\u2713" : "\u2717"}
                    </span>
                    <span className="text-muted">{result.filename}</span>
                    {result.title && (
                      <span className="font-medium">{result.title}</span>
                    )}
                  </span>
                  {result.success && result.slug ? (
                    <Link
                      href={`/articles/${result.slug}`}
                      className="text-[12px]"
                    >
                      View article
                    </Link>
                  ) : (
                    <span className="text-[12px] text-red-600">
                      {result.error}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="px-3 py-2 border-t border-border text-[12px] text-muted">
              {results.filter((r) => r.success).length} of {results.length}{" "}
              imported successfully
            </div>
          </div>
        </div>
      )}

      {/* Help section */}
      <div className="wiki-notice mt-4">
        <strong>File formats:</strong>
        <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[13px]">
          <li>
            <strong>Markdown</strong> (.md) — Title from frontmatter{" "}
            (<code className="bg-surface-hover px-1 text-[12px]">
              title: My Article
            </code>
            ), first heading, or filename
          </li>
          <li>
            <strong>Text</strong> (.txt) — Title from filename, content wrapped
            in paragraphs
          </li>
          <li>
            <strong>HTML</strong> (.html) — Title from{" "}
            <code className="bg-surface-hover px-1 text-[12px]">
              &lt;title&gt;
            </code>{" "}
            or{" "}
            <code className="bg-surface-hover px-1 text-[12px]">
              &lt;h1&gt;
            </code>
            , body content imported as-is
          </li>
          <li>
            <strong>JSON</strong> (.json) — Object or array with{" "}
            <code className="bg-surface-hover px-1 text-[12px]">title</code>,{" "}
            <code className="bg-surface-hover px-1 text-[12px]">content</code>,
            optional{" "}
            <code className="bg-surface-hover px-1 text-[12px]">
              format: &quot;markdown&quot;
            </code>
          </li>
          <li>
            <strong>MediaWiki XML</strong> (.xml) — Standard MediaWiki export
            format with{" "}
            <code className="bg-surface-hover px-1 text-[12px]">
              &lt;page&gt;
            </code>{" "}
            elements containing title and revision text
          </li>
        </ul>
      </div>
    </div>
  );
}
