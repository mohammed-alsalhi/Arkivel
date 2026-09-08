"use client";

import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export default function Collapsible({ title, children, defaultOpen = false, className = "" }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border border-border ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-bold text-heading bg-surface-hover hover:bg-surface transition-colors text-left"
      >
        <span>{title}</span>
        <span className="text-muted text-[11px]">{open ? "\u25BC" : "\u25B6"}</span>
      </button>
      {open && (
        <div className="px-3 py-2 text-[13px] border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}
