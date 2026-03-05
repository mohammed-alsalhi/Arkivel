"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

type GraphNode = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  categorySlug: string | null;
  // d3 adds these
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type GraphEdge = {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  relation?: string;
};

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (slug: string) => void;
  centerSlug?: string;
  clusterMode?: boolean;
};

// Label-propagation community detection
function detectClusters(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const labels = new Map<string, string>();
  nodes.forEach((n) => labels.set(n.id, n.id));

  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    const s = typeof e.source === "string" ? e.source : (e.source as GraphNode).id;
    const t = typeof e.target === "string" ? e.target : (e.target as GraphNode).id;
    adj.get(s)?.push(t);
    adj.get(t)?.push(s);
  });

  for (let iter = 0; iter < 10; iter++) {
    const order = [...nodes].sort(() => 0.5 - Math.random());
    for (const node of order) {
      const neighbors = adj.get(node.id) ?? [];
      if (neighbors.length === 0) continue;
      const freq = new Map<string, number>();
      for (const nb of neighbors) {
        const lbl = labels.get(nb) ?? nb;
        freq.set(lbl, (freq.get(lbl) ?? 0) + 1);
      }
      let best = labels.get(node.id)!;
      let bestCount = 0;
      freq.forEach((cnt, lbl) => { if (cnt > bestCount) { best = lbl; bestCount = cnt; } });
      labels.set(node.id, best);
    }
  }

  const labelToId = new Map<string, number>();
  let nextId = 0;
  const clusterMap = new Map<string, number>();
  labels.forEach((lbl, id) => {
    if (!labelToId.has(lbl)) labelToId.set(lbl, nextId++);
    clusterMap.set(id, labelToId.get(lbl)!);
  });
  return clusterMap;
}

const CATEGORY_COLORS: Record<string, string> = {
  People: "#4e79a7",
  Places: "#59a14f",
  Organizations: "#f28e2b",
  Events: "#e15759",
  Things: "#76b7b2",
  Concepts: "#b07aa1",
};

function getCategoryColor(category: string | null): string {
  if (!category) return "#999";
  return CATEGORY_COLORS[category] || d3.schemeCategory10[
    Math.abs(hashString(category)) % 10
  ];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

export default function ArticleGraph({ nodes, edges, onNodeClick, centerSlug, clusterMode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  const buildGraph = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (nodes.length === 0) return;

    const container = svgRef.current!.parentElement!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);

    // Create zoomable group
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as unknown as (selection: d3.Selection<SVGSVGElement | null, unknown, null, undefined>) => void);

    // Deep clone nodes and edges so d3 can mutate them
    const nodeData: GraphNode[] = nodes.map((n) => ({ ...n }));
    const edgeData: GraphEdge[] = edges.map((e) => ({ ...e }));

    // Cluster detection
    const clusterMap = clusterMode ? detectClusters(nodeData, edgeData) : new Map<string, number>();
    const clusterColors = d3.schemeTableau10 as readonly string[];

    // Hull group (drawn below nodes)
    const hullGroup = g.append("g").attr("class", "hulls");

    function updateHulls() {
      if (!clusterMode) return;
      const byCluster = new Map<number, [number, number][]>();
      nodeData.forEach((nd) => {
        const cid = clusterMap.get(nd.id) ?? 0;
        if (!byCluster.has(cid)) byCluster.set(cid, []);
        byCluster.get(cid)!.push([nd.x ?? 0, nd.y ?? 0]);
      });

      const hulls: { cid: number; hull: [number, number][] }[] = [];
      byCluster.forEach((pts, cid) => {
        if (pts.length < 3) {
          hulls.push({ cid, hull: pts });
          return;
        }
        const h = d3.polygonHull(pts);
        if (h) hulls.push({ cid, hull: h });
      });

      const sel = hullGroup.selectAll<SVGPathElement, { cid: number; hull: [number, number][] }>("path")
        .data(hulls, (d) => String(d.cid));

      sel.enter().append("path")
        .merge(sel)
        .attr("d", (d) => {
          if (d.hull.length < 3) return "";
          return `M${d.hull.map((p) => p.join(",")).join("L")}Z`;
        })
        .attr("fill", (d) => clusterColors[d.cid % clusterColors.length])
        .attr("fill-opacity", 0.08)
        .attr("stroke", (d) => clusterColors[d.cid % clusterColors.length])
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.3);

      sel.exit().remove();
    }

    // Create simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodeData)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphEdge>(edgeData)
          .id((d) => d.id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(20));

    simulationRef.current = simulation;

    // Draw edges
    const link = g
      .append("g")
      .selectAll<SVGLineElement, GraphEdge>("line")
      .data(edgeData)
      .enter()
      .append("line")
      .attr("stroke", (d) => d.type === "semantic" ? "#e15759" : "#ccc")
      .attr("stroke-width", (d) => d.type === "semantic" ? 1.5 : 1)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", (d) => d.type === "semantic" ? "4,2" : "none");

    // Draw nodes
    const node = g
      .append("g")
      .selectAll<SVGCircleElement, GraphNode>("circle")
      .data(nodeData)
      .enter()
      .append("circle")
      .attr("r", (d) => (d.slug === centerSlug ? 10 : 6))
      .attr("fill", (d) => clusterMode
        ? clusterColors[(clusterMap.get(d.id) ?? 0) % clusterColors.length]
        : getCategoryColor(d.category)
      )
      .attr("stroke", (d) => (d.slug === centerSlug ? "#000" : "#fff"))
      .attr("stroke-width", (d) => (d.slug === centerSlug ? 2 : 1))
      .attr("cursor", "pointer")
      .on("click", (_event, d) => {
        onNodeClick(d.slug);
      })
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .attr(
        "style",
        "position:absolute;pointer-events:none;background:var(--color-surface);border:1px solid var(--color-border);padding:4px 8px;font-size:12px;display:none;z-index:20;white-space:nowrap;"
      );

    node
      .on("mouseenter", (event, d) => {
        tooltip
          .style("display", "block")
          .html(
            `<strong>${d.title}</strong>${d.category ? `<br/><span style="color:var(--color-muted)">${d.category}</span>` : ""}`
          );
      })
      .on("mousemove", (event) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - rect.left + 12}px`)
          .style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", () => {
        tooltip.style("display", "none");
      });

    // Labels for larger graphs (only show if few nodes)
    if (nodeData.length <= 50) {
      g.append("g")
        .selectAll<SVGTextElement, GraphNode>("text")
        .data(nodeData)
        .enter()
        .append("text")
        .text((d) => d.title.length > 20 ? d.title.slice(0, 18) + "..." : d.title)
        .attr("font-size", "9px")
        .attr("dx", 10)
        .attr("dy", 3)
        .attr("fill", "var(--color-foreground)")
        .attr("pointer-events", "none");
    }

    // Tick
    simulation.on("tick", () => {
      updateHulls();
      link
        .attr("x1", (d) => ((d.source as GraphNode).x ?? 0))
        .attr("y1", (d) => ((d.source as GraphNode).y ?? 0))
        .attr("x2", (d) => ((d.target as GraphNode).x ?? 0))
        .attr("y2", (d) => ((d.target as GraphNode).y ?? 0));

      node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);

      if (nodeData.length <= 50) {
        g.selectAll<SVGTextElement, GraphNode>("text")
          .attr("x", (d) => d.x ?? 0)
          .attr("y", (d) => d.y ?? 0);
      }
    });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
      simulation.stop();
    };
  }, [nodes, edges, onNodeClick, centerSlug, clusterMode]);

  useEffect(() => {
    const cleanup = buildGraph();
    return () => {
      if (cleanup) cleanup();
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [buildGraph]);

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "100%", background: "var(--color-surface)" }}
    />
  );
}
