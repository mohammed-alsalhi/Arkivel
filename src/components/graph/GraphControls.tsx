"use client";

type Props = {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  depth: number;
  onDepthChange: (d: number) => void;
  centerSlug: string;
  onCenterChange: (slug: string) => void;
  nodeCount: number;
  edgeCount: number;
  clusterMode: boolean;
  onClusterModeChange: (v: boolean) => void;
};

export default function GraphControls({
  categories,
  selectedCategory,
  onCategoryChange,
  depth,
  onDepthChange,
  centerSlug,
  onCenterChange,
  nodeCount,
  edgeCount,
  clusterMode,
  onClusterModeChange,
}: Props) {
  return (
    <div className="absolute top-3 left-3 z-10 bg-surface border border-border p-3 text-[12px] space-y-2 shadow-sm max-w-[220px]">
      <div className="font-semibold text-[13px] text-heading border-b border-border pb-1 mb-1">
        Graph Controls
      </div>

      {/* Category filter */}
      <div>
        <label className="block text-muted mb-0.5">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full border border-border px-1.5 py-1 bg-surface text-[12px]"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Depth slider */}
      <div>
        <label className="block text-muted mb-0.5">
          Depth: {depth}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={depth}
          onChange={(e) => onDepthChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Center article */}
      {centerSlug && (
        <div>
          <label className="block text-muted mb-0.5">Centered on:</label>
          <div className="flex items-center gap-1">
            <span className="font-mono truncate flex-1">{centerSlug}</span>
            <button
              onClick={() => onCenterChange("")}
              className="text-muted hover:text-foreground"
              title="Clear center"
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* Cluster mode */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={clusterMode}
            onChange={(e) => onClusterModeChange(e.target.checked)}
          />
          <span className="text-muted">Show clusters</span>
        </label>
      </div>

      {/* Stats */}
      <div className="text-muted border-t border-border pt-1">
        {nodeCount} nodes, {edgeCount} edges
      </div>
    </div>
  );
}
