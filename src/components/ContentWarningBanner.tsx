"use client";

import { useState } from "react";

const CW_LABELS: Record<string, string> = {
  spoilers: "Spoilers",
  violence: "Violence",
  mature: "Mature content",
  "sensitive-topics": "Sensitive topics",
  "strong-language": "Strong language",
  medical: "Medical / graphic",
};

export default function ContentWarningBanner({ warnings }: { warnings: string[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (!warnings || warnings.length === 0 || dismissed) return null;

  const labels = warnings.map((w) => CW_LABELS[w] || w);

  return (
    <div className="mb-4 border border-amber-400 rounded bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-[13px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-semibold text-amber-700 dark:text-amber-400">
            Content warning:
          </span>{" "}
          <span className="text-amber-700 dark:text-amber-300">{labels.join(", ")}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-amber-500 hover:text-amber-700 text-[11px] border border-amber-300 rounded px-1.5 py-0.5"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
