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
      className="text-xs px-2 py-0.5 border border-border rounded hover:bg-surface-hover"
      aria-label="Toggle text direction"
    >
      {dir === "rtl" ? "LTR" : "RTL"}
    </button>
  );
}
