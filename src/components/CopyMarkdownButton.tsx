"use client";

import { useState } from "react";

interface Props {
  markdown: string | null | undefined;
  title: string;
}

export default function CopyMarkdownButton({ markdown, title }: Props) {
  const [copied, setCopied] = useState(false);

  if (!markdown) return null;

  async function handleCopy() {
    const text = `# ${title}\n\n${markdown}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without clipboard API
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy article as Markdown"
      className="ui-button"
    >
      {copied ? "Copied!" : "Copy MD"}
    </button>
  );
}
