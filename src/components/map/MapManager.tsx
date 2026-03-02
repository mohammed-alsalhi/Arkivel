"use client";

import { useState } from "react";

type MapConfig = {
  id: string;
  mapId: string;
  name: string;
  description: string | null;
  imageUrl: string;
  sortOrder: number;
};

export default function MapManager({
  maps,
  onRefresh,
}: {
  maps: MapConfig[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    mapId: "",
    name: "",
    description: "",
    imageUrl: "",
  });

  function resetForm() {
    setForm({ mapId: "", name: "", description: "", imageUrl: "" });
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(map: MapConfig) {
    setForm({
      mapId: map.mapId,
      name: map.name,
      description: map.description || "",
      imageUrl: map.imageUrl,
    });
    setEditingId(map.mapId);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      // Update existing
      await fetch(`/api/maps/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          imageUrl: form.imageUrl,
        }),
      });
    } else {
      // Create new
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create map");
        return;
      }
    }

    resetForm();
    onRefresh();
  }

  async function handleDelete(mapId: string) {
    if (!confirm("Delete this map and all its layers, detail levels, and markers?")) {
      return;
    }
    await fetch(`/api/maps/${mapId}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="border border-border">
      <div className="bg-infobox-header px-3 py-1.5 flex items-center justify-between">
        <h3 className="text-[12px] font-bold text-foreground uppercase tracking-wider">
          Map Configurations
        </h3>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="text-[11px] text-accent hover:underline"
          >
            + Add map
          </button>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Existing maps */}
        {maps.map((map) => (
          <div
            key={map.mapId}
            className="flex items-center justify-between border border-border-light p-2"
          >
            <div>
              <span className="text-[13px] font-bold text-heading">{map.name}</span>
              <span className="text-[11px] text-muted ml-2">({map.mapId})</span>
              {map.description && (
                <p className="text-[11px] text-muted">{map.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEdit(map)}
                className="text-[11px] text-accent hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(map.mapId)}
                className="text-[11px] text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {maps.length === 0 && !showForm && (
          <p className="text-[12px] text-muted italic">No maps configured yet.</p>
        )}

        {/* Create / edit form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="border border-border-light p-3 space-y-2">
            <h4 className="text-[12px] font-bold text-heading">
              {editingId ? "Edit Map" : "New Map"}
            </h4>
            {!editingId && (
              <input
                type="text"
                value={form.mapId}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    mapId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
                placeholder="Map ID (e.g., world-map)..."
                required
                className="w-full border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
              />
            )}
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Map name..."
              required
              className="w-full border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)..."
              className="w-full border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="Image URL (e.g., /maps/world.webp)..."
              required
              className="w-full border border-border bg-surface px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-accent px-3 py-1 text-[12px] font-bold text-white hover:bg-accent-hover"
              >
                {editingId ? "Save" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-border px-3 py-1 text-[12px] text-foreground hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
