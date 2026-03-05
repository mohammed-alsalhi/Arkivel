"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import * as d3 from "d3";

type CMNode = { id: string; title: string; slug: string; x?: number; y?: number; fx?: number | null; fy?: number | null };
type CMEdge = { source: string | CMNode; target: string | CMNode };
type Category = { id: string; name: string; slug: string };

function ConceptMapCanvas({ nodes, edges }: { nodes: CMNode[]; edges: CMEdge[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<CMNode, CMEdge> | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    if (nodes.length === 0) return;

    const container = svgRef.current!.parentElement!;
    const w = container.clientWidth;
    const h = container.clientHeight;
    svg.attr("width", w).attr("height", h);

    const g = svg.append("g");
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 8])
        .on("zoom", (ev) => g.attr("transform", ev.transform)) as unknown as (sel: d3.Selection<SVGSVGElement | null, unknown, null, undefined>) => void
    );

    const nd: CMNode[] = nodes.map((n) => ({ ...n }));
    const ed: CMEdge[] = edges.map((e) => ({ ...e }));

    const sim = d3.forceSimulation<CMNode>(nd)
      .force("link", d3.forceLink<CMNode, CMEdge>(ed).id((d) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide().radius(30));

    simRef.current = sim;

    const link = g.append("g")
      .selectAll<SVGLineElement, CMEdge>("line")
      .data(ed).enter().append("line")
      .attr("stroke", "var(--color-border)")
      .attr("stroke-width", 1.5);

    const node = g.append("g")
      .selectAll<SVGGElement, CMNode>("g")
      .data(nd).enter().append("g")
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, CMNode>()
          .on("start", (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
          .on("end", (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on("click", (_ev, d) => { window.location.href = `/articles/${d.slug}`; });

    node.append("circle")
      .attr("r", 20)
      .attr("fill", "var(--color-accent)")
      .attr("fill-opacity", 0.15)
      .attr("stroke", "var(--color-accent)")
      .attr("stroke-width", 1.5);

    node.append("text")
      .text((d) => d.title.length > 16 ? d.title.slice(0, 14) + "…" : d.title)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("fill", "var(--color-foreground)")
      .attr("pointer-events", "none");

    sim.on("tick", () => {
      link
        .attr("x1", (d) => ((d.source as CMNode).x ?? 0))
        .attr("y1", (d) => ((d.source as CMNode).y ?? 0))
        .attr("x2", (d) => ((d.target as CMNode).x ?? 0))
        .attr("y2", (d) => ((d.target as CMNode).y ?? 0));
      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => { sim.stop(); };
  }, [nodes, edges]);

  return (
    <svg ref={svgRef} style={{ width: "100%", height: "100%", background: "var(--color-surface)" }} />
  );
}

export default function ConceptMapPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [nodes, setNodes] = useState<CMNode[]>([]);
  const [edges, setEdges] = useState<CMEdge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const catRes = await fetch("/api/categories");
    if (catRes.ok) {
      const data = await catRes.json();
      const flat: Category[] = [];
      function walk(list: (Category & { children?: Category[] })[]) {
        for (const c of list) { flat.push(c); if (c.children) walk(c.children); }
      }
      walk(data);
      const found = flat.find((c) => c.slug === slug);
      if (found) {
        setCategory(found);
        const mapRes = await fetch(`/api/categories/${found.id}/concept-map`);
        if (mapRes.ok) {
          const { nodes: n, edges: e } = await mapRes.json();
          setNodes(n);
          setEdges(e);
        }
      }
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface shrink-0">
        {category && (
          <Link href={`/categories/${slug}`} className="text-[13px] text-muted hover:text-foreground">
            ← {category.name}
          </Link>
        )}
        <h1 className="text-[13px] font-bold text-heading">
          {category ? `Concept map: ${category.name}` : "Concept map"}
        </h1>
        <span className="text-[11px] text-muted ml-auto">
          {nodes.length} articles · {edges.length} links
        </span>
      </div>
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-[13px] text-muted">Loading...</div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[13px] text-muted">
            No articles in this category yet.
          </div>
        ) : (
          <ConceptMapCanvas nodes={nodes} edges={edges} />
        )}
      </div>
    </div>
  );
}
