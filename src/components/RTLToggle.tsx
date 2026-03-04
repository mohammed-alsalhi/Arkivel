"use client";

import { useState } from "react";

interface Props {
  defaultDir: string;
}

export default function RTLToggle({ defaultDir }: Props) {
  const [dir, setDir] = useState(defaultDir);

  function toggle() {
    const next = dir === "rtl" ? "ltr" : "rtl";
    setDir(next);
    // Apply to the article content wrapper only
    const wrapper = document.getElementById("article-content");
    if (wrapper) wrapper.dir = next;
  }

  return (
    <button
      onClick={toggle}
      title={dir === "rtl" ? "Switch to LTR reading" : "Switch to RTL reading"}
      className="flex items-center h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
      aria-label="Toggle text direction"
    >
      {dir === "rtl" ? "LTR" : "RTL"}
    </button>
  );
}
