"use client";

import { useEffect, useRef } from "react";

interface Props {
  latex: string;
  block?: boolean;
}

export default function KaTeXBlock({ latex, block = false }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    import("katex").then((m) => {
      m.default.render(latex, ref.current!, {
        displayMode: block,
        throwOnError: false,
        errorColor: "var(--color-danger)",
      });
    }).catch(() => {
      if (ref.current) ref.current.textContent = latex;
    });
  }, [latex, block]);

  if (block) return <div ref={ref as React.RefObject<HTMLDivElement>} className="katex-block my-4 overflow-auto text-center" />;
  return <span ref={ref} className="katex-inline" />;
}
