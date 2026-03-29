"use client";

import { useMemo } from "react";

// Common English stop words to exclude
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from","up",
  "about","into","through","during","before","after","above","below","between","out","off",
  "over","under","again","further","then","once","here","there","when","where","why","how",
  "all","both","each","few","more","most","other","some","such","no","nor","not","only",
  "own","same","so","than","too","very","can","will","just","should","now","i","me","my",
  "we","our","you","your","he","his","she","her","they","them","their","it","its","this",
  "that","these","those","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","would","could","should","may","might","shall","must","also","as","if",
  "was","were","which","who","whom","what","its","been","being","s","t","don","de","la","le",
]);

function getTopWords(html: string, limit = 40): { word: string; count: number }[] {
  const text = html.replace(/<[^>]+>/g, " ").toLowerCase();
  const words = text.match(/\b[a-z]{3,}\b/g) ?? [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      freq[w] = (freq[w] ?? 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export default function WordFrequencyCloud({ html }: { html: string }) {
  const words = useMemo(() => getTopWords(html), [html]);

  if (words.length === 0) return null;

  const max = words[0].count;
  const min = words[words.length - 1].count;

  function fontSize(count: number): string {
    if (max === min) return "0.85rem";
    const pct = (count - min) / (max - min);
    const size = 0.72 + pct * 1.4;
    return `${size.toFixed(2)}rem`;
  }

  function opacity(count: number): number {
    if (max === min) return 0.8;
    const pct = (count - min) / (max - min);
    return 0.45 + pct * 0.55;
  }

  return (
    <div className="mt-4 border-t border-border pt-3">
      <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
        Word frequency
      </h3>
      <div className="flex flex-wrap gap-x-2 gap-y-1 leading-relaxed">
        {words.map(({ word, count }) => (
          <span
            key={word}
            title={`${count} occurrence${count !== 1 ? "s" : ""}`}
            style={{ fontSize: fontSize(count), opacity: opacity(count) }}
            className="text-foreground cursor-default select-none"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
