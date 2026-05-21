"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as Y from "yjs";
import { prosemirrorToYXmlFragment, yXmlFragmentToProseMirrorRootNode } from "y-prosemirror";
import TiptapEditor, { type TiptapEditorHandle } from "./TiptapEditor";

type User = {
  id: string;
  name: string;
  color: string;
  isMe: boolean;
};

type Props = {
  articleId: string;
  initialHtml?: string;
  articleTitle?: string;
  onHtmlChange?: (html: string) => void;
  editorRef?: React.RefObject<TiptapEditorHandle | null>;
};

const SYNC_INTERVAL_MS = 2000;
const PRESENCE_INTERVAL_MS = 10000;

export default function CollaborativeEditor({ articleId, initialHtml, articleTitle, onHtmlChange, editorRef }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const ydocRef = useRef<Y.Doc | null>(null);
  const localEditorRef = useRef<TiptapEditorHandle | null>(null);
  const activeEditorRef = editorRef ?? localEditorRef;
  const pendingUpdateRef = useRef(false);
  const serverStateRef = useRef<Uint8Array | null>(null);

  const syncToServer = useCallback(async () => {
    if (!enabled || !ydocRef.current || !activeEditorRef.current) return;
    setSyncing(true);
    setSyncError(false);
    try {
      // Get current editor HTML and encode as Yjs update
      const html = activeEditorRef.current.getHTML();
      const ydoc = ydocRef.current;

      // Encode the current state as an update
      const update = Y.encodeStateAsUpdate(ydoc);
      const b64 = Buffer.from(update).toString("base64");

      const res = await fetch(`/api/collab/${articleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ update: b64, html }),
      });

      if (res.ok) {
        const data = await res.json();
        const remoteState = Buffer.from(data.state, "base64");

        // Apply remote changes if they're newer
        const remoteDoc = new Y.Doc();
        Y.applyUpdate(remoteDoc, remoteState);

        // Check if remote has changes we don't have
        const diffUpdate = Y.diffUpdate(remoteState, Y.encodeStateVector(ydoc));
        if (diffUpdate.length > 2) {
          // There are remote changes — apply them
          Y.applyUpdate(ydoc, diffUpdate);
          serverStateRef.current = remoteState;
          pendingUpdateRef.current = false;
        }
        setLastSynced(new Date());
      } else {
        setSyncError(true);
      }
    } catch {
      setSyncError(true);
    }
    setSyncing(false);
  }, [enabled, articleId, activeEditorRef]);

  // Initialize Yjs doc and load server state
  useEffect(() => {
    if (!enabled) return;
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    fetch(`/api/collab/${articleId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.state) {
          const state = Buffer.from(data.state, "base64");
          Y.applyUpdate(ydoc, state);
          serverStateRef.current = state;
        }
      })
      .catch(() => {});

    return () => { ydoc.destroy(); ydocRef.current = null; };
  }, [articleId, enabled]);

  // Sync loop
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(syncToServer, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, syncToServer]);

  // Presence loop
  useEffect(() => {
    if (!enabled) return;

    async function updatePresence() {
      const res = await fetch(`/api/collab/${articleId}/presence`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
      }
    }

    updatePresence();
    const interval = setInterval(updatePresence, PRESENCE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      // Signal departure
      fetch(`/api/collab/${articleId}/presence`, { method: "DELETE" }).catch(() => {});
    };
  }, [articleId, enabled]);

  const otherUsers = users.filter((u) => !u.isMe);

  return (
    <div>
      {/* Collab toolbar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEnabled((v) => !v)}
            className={`h-6 px-2 text-[11px] border rounded transition-colors flex items-center gap-1 ${
              enabled
                ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-100"
                : "border-border text-muted hover:bg-surface-hover"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            {enabled ? "Live" : "Enable live editing"}
          </button>

          {enabled && otherUsers.length > 0 && (
            <div className="flex items-center gap-1">
              {otherUsers.map((u) => (
                <span
                  key={u.id}
                  title={u.name}
                  className="flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold"
                  style={{ background: u.color }}
                >
                  {u.name[0]?.toUpperCase()}
                </span>
              ))}
              <span className="text-[11px] text-muted ml-1">
                {otherUsers.length} other{otherUsers.length !== 1 ? "s" : ""} editing
              </span>
            </div>
          )}

          {enabled && otherUsers.length === 0 && (
            <span className="text-[11px] text-muted">Only you</span>
          )}
        </div>

        {enabled && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            {syncing && (
              <svg className="w-3 h-3 animate-spin text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {syncError && <span className="text-red-500">Sync error</span>}
            {lastSynced && !syncing && !syncError && (
              <span>Synced {lastSynced.toLocaleTimeString()}</span>
            )}
            <button
              onClick={syncToServer}
              className="text-accent hover:underline"
            >
              Sync now
            </button>
          </div>
        )}
      </div>

      <TiptapEditor
        ref={activeEditorRef}
        content={initialHtml}
        placeholder="Begin writing your article…"
        articleTitle={articleTitle}
        onUpdate={enabled ? () => { pendingUpdateRef.current = true; } : undefined}
      />
    </div>
  );
}
