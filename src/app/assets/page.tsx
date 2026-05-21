"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Asset = {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
  size: number;
  createdAt: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadAssets(mime?: string) {
    setLoading(true);
    const url = `/api/assets${mime && mime !== "all" ? `?mime=${mime}` : ""}`;
    fetch(url)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setAssets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadAssets(filter === "all" ? undefined : filter); }, [filter]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      await fetch("/api/assets", { method: "POST", body: fd }).catch(() => {});
    }
    setUploading(false);
    loadAssets();
    e.target.value = "";
  }

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "image/", label: "Images" },
    { value: "application/pdf", label: "PDFs" },
    { value: "audio/", label: "Audio" },
    { value: "video/", label: "Video" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Asset Library</h1>
          <p className="text-sm text-muted mt-1">Upload and manage images, PDFs, and other files.</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-6 px-2 text-[11px] border border-border rounded bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload files"}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`h-6 px-2 text-[11px] border border-border rounded transition-colors ${
              filter === opt.value ? "bg-accent text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-muted py-4">Loading…</div>}

      {!loading && assets.length === 0 && (
        <div className="border border-border rounded-lg p-8 text-center text-muted">
          <p className="text-sm">No assets yet.</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-[11px] border border-border rounded px-2 h-6 hover:bg-muted/30"
          >
            Upload your first file
          </button>
        </div>
      )}

      {/* Asset grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {assets.map((asset) => (
          <div key={asset.id} className="border border-border rounded-lg overflow-hidden group">
            {asset.mimeType.startsWith("image/") ? (
              <div className="aspect-square bg-muted/20 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ) : (
              <div className="aspect-square bg-muted/20 flex items-center justify-center">
                <span className="text-2xl text-muted">{asset.mimeType.startsWith("application/pdf") ? "PDF" : "FILE"}</span>
              </div>
            )}
            <div className="p-2">
              <div className="text-[11px] text-heading font-medium truncate" title={asset.filename}>{asset.filename}</div>
              <div className="text-[10px] text-muted">{formatSize(asset.size)}</div>
              <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline">
                Open
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
