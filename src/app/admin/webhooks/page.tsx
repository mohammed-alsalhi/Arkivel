"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminContext";
import { Button, DataTable, EmptyState, Page, PageHeader } from "@/components/ui";

type WebhookDelivery = {
  id: string;
  event: string;
  status: string;
  responseCode: number | null;
  createdAt: string;
};

type Webhook = {
  id: string;
  url: string;
  events: string[];
  secret: string | null;
  active: boolean;
  createdAt: string;
  deliveries: WebhookDelivery[];
  _count: { deliveries: number };
};

const AVAILABLE_EVENTS = [
  "article.created",
  "article.updated",
  "article.deleted",
];

export default function WebhooksPage() {
  const isAdmin = useAdmin();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    const res = await fetch("/api/webhooks");
    if (res.ok) {
      setWebhooks(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchWebhooks();
    }
  }, [isAdmin, fetchWebhooks]);

  if (!isAdmin) {
    return (
      <Page>
        <PageHeader title="Webhooks" />
        <div className="wiki-notice">
          You must be <Link href="/admin">logged in as admin</Link> to manage webhooks.
        </div>
      </Page>
    );
  }

  async function handleCreate() {
    if (!newUrl || newEvents.length === 0) return;
    setCreating(true);
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: newUrl,
        events: newEvents,
        secret: newSecret || undefined,
      }),
    });
    if (res.ok) {
      setNewUrl("");
      setNewEvents([]);
      setNewSecret("");
      setShowCreate(false);
      await fetchWebhooks();
    }
    setCreating(false);
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/webhooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    await fetchWebhooks();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook?")) return;
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    await fetchWebhooks();
  }

  function toggleEvent(event: string) {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  return (
    <Page>
      <PageHeader
        title="Webhooks"
        description="Webhooks send HTTP POST requests to external URLs when events occur."
        actions={
          <Button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cancel" : "Create webhook"}
          </Button>
        }
      />

      {/* Create form */}
      {showCreate && (
        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">New Webhook</div>
          <div className="wiki-portal-body space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-muted mb-1">
                Payload URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="w-full border border-border px-2 py-1.5 text-[13px] bg-surface"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-muted mb-1">
                Events
              </label>
              <div className="flex gap-3">
                {AVAILABLE_EVENTS.map((event) => (
                  <label key={event} className="flex items-center gap-1 text-[13px]">
                    <input
                      type="checkbox"
                      checked={newEvents.includes(event)}
                      onChange={() => toggleEvent(event)}
                    />
                    {event}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-muted mb-1">
                Secret (optional, for HMAC signature)
              </label>
              <input
                type="text"
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                placeholder="webhook-secret"
                className="w-full border border-border px-2 py-1.5 text-[13px] bg-surface font-mono"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating || !newUrl || newEvents.length === 0}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      )}

      {/* Webhook list */}
      {loading ? (
        <p className="text-[13px] text-muted">Loading...</p>
      ) : webhooks.length === 0 ? (
        <EmptyState
          title="No webhooks configured."
          description="Create one to start receiving event notifications."
        />
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="wiki-portal">
              <div className="wiki-portal-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      wh.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="font-mono text-[12px]">{wh.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(wh.id, wh.active)}
                    className="text-[11px] text-muted hover:text-foreground"
                  >
                    {wh.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className="text-[11px] text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="wiki-portal-body">
                <div className="flex items-center gap-4 text-[12px] text-muted mb-2">
                  <span>
                    Events:{" "}
                    {wh.events.map((e) => (
                      <code
                        key={e}
                        className="bg-surface-hover px-1 py-0.5 text-[11px] mr-1"
                      >
                        {e}
                      </code>
                    ))}
                  </span>
                  <span>{wh._count.deliveries} deliveries</span>
                  {wh.secret && <span>HMAC: enabled</span>}
                </div>

                {/* Delivery log toggle */}
                {wh.deliveries.length > 0 && (
                  <div>
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === wh.id ? null : wh.id)
                      }
                      className="text-[12px] text-wiki-link hover:underline"
                    >
                      {expandedId === wh.id
                        ? "Hide delivery log"
                        : `Show recent deliveries (${wh.deliveries.length})`}
                    </button>
                    {expandedId === wh.id && (
                      <DataTable className="mt-2">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Status</th>
                            <th>Code</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wh.deliveries.map((d) => (
                            <tr key={d.id}>
                              <td className="font-mono">{d.event}</td>
                              <td>
                                <span
                                  className={
                                    d.status === "success"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {d.status}
                                </span>
                              </td>
                              <td>{d.responseCode || "-"}</td>
                              <td className="text-muted">
                                {new Date(d.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </DataTable>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
