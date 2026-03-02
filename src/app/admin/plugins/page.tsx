"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/plugins")
      .then((r) => {
        if (r.status === 401) {
          setError("Unauthorized. Please log in as admin.");
          router.push("/admin");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setPlugins(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load plugins");
        setLoading(false);
      });
  }, [router]);

  async function handleToggle(pluginId: string, enabled: boolean) {
    const res = await fetch("/api/plugins", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pluginId, enabled }),
    });

    if (res.ok) {
      setPlugins((prev) =>
        prev.map((p) => (p.id === pluginId ? { ...p, enabled } : p))
      );
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-muted italic text-[13px]">
        Loading plugins...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-wiki-link-broken text-[13px]">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1
        className="text-[1.5rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Plugins
      </h1>

      <div className="wiki-notice mb-4">
        Manage installed plugins. Enable or disable plugins to extend wiki
        functionality.
      </div>

      {plugins.length === 0 ? (
        <div className="border border-border p-6 text-center">
          <p className="text-[13px] text-muted">
            No plugins installed yet. Plugins can be registered in{" "}
            <code className="bg-background px-1 py-0.5 text-[12px]">
              src/lib/plugins/registry.ts
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex items-center justify-between border border-border p-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-heading">
                    {plugin.name}
                  </span>
                  <span className="text-[10px] text-muted border border-border-light px-1.5 py-0.5">
                    v{plugin.version}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 ${
                      plugin.enabled
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-surface-hover text-muted border border-border-light"
                    }`}
                  >
                    {plugin.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                {plugin.description && (
                  <p className="text-[12px] text-muted mt-0.5">
                    {plugin.description}
                  </p>
                )}
                <p className="text-[10px] text-muted mt-0.5">
                  ID: {plugin.id}
                </p>
              </div>

              <button
                onClick={() => handleToggle(plugin.id, !plugin.enabled)}
                className={`px-3 py-1 text-[12px] font-bold transition-colors ${
                  plugin.enabled
                    ? "border border-border text-foreground hover:bg-surface-hover"
                    : "bg-accent text-white hover:bg-accent-hover"
                }`}
              >
                {plugin.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
