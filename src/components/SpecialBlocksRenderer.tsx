"use client";

/**
 * SpecialBlocksRenderer — client component that splits article HTML
 * and replaces special block placeholders with interactive components.
 *
 * Must be a Client Component so that sub-components (MermaidBlock, KaTeXBlock,
 * DataTable, DecisionTreeDisplay) can use useEffect / browser APIs.
 * `next/dynamic` with `ssr: false` is only valid inside Client Components.
 */

import dynamic from "next/dynamic";

const MermaidBlock = dynamic(() => import("./MermaidBlock"), { ssr: false });
const KaTeXBlock = dynamic(() => import("./KaTeXBlock"), { ssr: false });
const DataTable = dynamic(() => import("./DataTable"), { ssr: false });
const DecisionTreeDisplay = dynamic(() => import("./DecisionTreeDisplay"), { ssr: false });

const SPECIAL_BLOCK_RE =
  /<(div|span)\s+data-(mermaid|katex-block|katex-inline|table|decision-tree)="([^"]*)"/gi;

interface Segment {
  type: "html" | "mermaid" | "katex-block" | "katex-inline" | "table" | "decision-tree";
  value: string;
}

function parseSegments(html: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  SPECIAL_BLOCK_RE.lastIndex = 0;

  while ((match = SPECIAL_BLOCK_RE.exec(html)) !== null) {
    const matchStart = match.index;
    const tag = match[1];
    const type = match[2] as Segment["type"];
    const value = match[3];

    const closeTag = `</${tag}>`;
    const closeIdx = html.indexOf(closeTag, SPECIAL_BLOCK_RE.lastIndex);
    const blockEnd = closeIdx !== -1 ? closeIdx + closeTag.length : SPECIAL_BLOCK_RE.lastIndex;

    if (matchStart > lastIndex) {
      segments.push({ type: "html", value: html.slice(lastIndex, matchStart) });
    }

    try {
      segments.push({ type, value: decodeURIComponent(value) });
    } catch {
      segments.push({ type, value });
    }

    lastIndex = blockEnd;
    SPECIAL_BLOCK_RE.lastIndex = blockEnd;
  }

  if (lastIndex < html.length) {
    segments.push({ type: "html", value: html.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "html", value: html });
  }

  return segments;
}

interface Props {
  html: string;
}

export default function SpecialBlocksRenderer({ html }: Props) {
  const segments = parseSegments(html);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "html") {
          return (
            <div
              key={i}
              className="wiki-content"
              dangerouslySetInnerHTML={{ __html: seg.value }}
            />
          );
        }
        if (seg.type === "mermaid") return <MermaidBlock key={i} code={seg.value} />;
        if (seg.type === "katex-block") return <KaTeXBlock key={i} latex={seg.value} block />;
        if (seg.type === "katex-inline") return <KaTeXBlock key={i} latex={seg.value} />;
        if (seg.type === "table") return <DataTable key={i} source={seg.value} />;
        if (seg.type === "decision-tree") return <DecisionTreeDisplay key={i} treeJson={seg.value} />;
        return null;
      })}
    </>
  );
}
