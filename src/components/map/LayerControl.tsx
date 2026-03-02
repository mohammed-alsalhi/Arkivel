"use client";

type Layer = {
  id: string;
  name: string;
  opacity: number;
  visible: boolean;
};

export default function LayerControl({
  layers,
  onToggle,
  onOpacityChange,
}: {
  layers: Layer[];
  onToggle: (layerId: string, visible: boolean) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}) {
  if (layers.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-56 border border-border bg-surface shadow-md">
      <div className="bg-infobox-header px-3 py-1">
        <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
          Layers
        </h4>
      </div>
      <div className="p-2 space-y-2">
        {layers.map((layer) => (
          <div key={layer.id} className="space-y-1">
            <label className="flex items-center gap-2 text-[12px] text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={(e) => onToggle(layer.id, e.target.checked)}
              />
              {layer.name}
            </label>
            {layer.visible && (
              <div className="flex items-center gap-2 pl-5">
                <span className="text-[10px] text-muted">Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layer.opacity}
                  onChange={(e) =>
                    onOpacityChange(layer.id, parseFloat(e.target.value))
                  }
                  className="flex-1 h-1 accent-accent"
                />
                <span className="text-[10px] text-muted w-8 text-right">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
