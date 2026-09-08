"use client";

export default function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className={`ui-button ${className}`}
      title="Print this page"
    >
      Print
    </button>
  );
}
