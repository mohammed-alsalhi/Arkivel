"use client";

export default function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className={`flex items-center h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors ${className}`}
      title="Print this page"
    >
      Print
    </button>
  );
}
