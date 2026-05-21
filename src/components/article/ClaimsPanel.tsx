"use client";

import { useState } from "react";

type Claim = {
  text: string;
  level: "certain" | "probable" | "disputed";
};

type Props = {
  html: string;
};

const LEVEL_STYLE = {
  certain: "border-l-green-500 bg-green-50 dark:bg-green-900/10",
  probable: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10",
  disputed: "border-l-red-500 bg-red-50 dark:bg-red-900/10",
};

const LEVEL_BADGE = {
  certain: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  probable: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  disputed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function extractClaims(html: string): Claim[] {
  const regex = /<span[^>]*data-claim="(certain|probable|disputed)"[^>]*>([\s\S]*?)<\/span>/g;
  const claims: Claim[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    const level = m[1] as Claim["level"];
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    if (text) claims.push({ text, level });
  }
  return claims;
}

export default function ClaimsPanel({ html }: Props) {
  const [open, setOpen] = useState(false);
  const claims = extractClaims(html);

  if (claims.length === 0) return null;

  const certain = claims.filter((c) => c.level === "certain").length;
  const probable = claims.filter((c) => c.level === "probable").length;
  const disputed = claims.filter((c) => c.level === "disputed").length;

  return (
    <div className="my-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[12px] text-muted hover:text-foreground transition-colors group"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium">{claims.length} claim{claims.length !== 1 ? "s" : ""} in this article</span>
        <span className="flex gap-1">
          {certain > 0 && <span className="text-[10px] font-bold text-green-600">{certain} certain</span>}
          {probable > 0 && <span className="text-[10px] font-bold text-yellow-600">{probable} probable</span>}
          {disputed > 0 && <span className="text-[10px] font-bold text-red-600">{disputed} disputed</span>}
        </span>
      </button>

      {open && (
        <div className="mt-2 space-y-1.5 border border-border rounded p-3 bg-surface">
          <p className="text-[11px] text-muted mb-2">
            Claims are sentences marked by editors with an epistemic confidence level.
            Hover over highlighted text in the article to see the label.
          </p>
          {claims.map((claim, i) => (
            <div key={i} className={`border-l-4 pl-3 py-1 text-[13px] ${LEVEL_STYLE[claim.level]}`}>
              <div className="flex items-start gap-2">
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${LEVEL_BADGE[claim.level]}`}>
                  {claim.level}
                </span>
                <span className="text-foreground leading-snug">{claim.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
