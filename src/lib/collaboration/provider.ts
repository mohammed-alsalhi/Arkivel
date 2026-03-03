/**
 * Client-side collaboration provider.
 *
 * y-websocket is not installed in this project, so we implement a minimal
 * WebSocket provider directly using yjs + y-protocols, which are available.
 *
 * The server (server/collab-server.ts) speaks the same y-protocols wire
 * format, so this provider is fully compatible with it.
 */

import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

const messageSync = 0;
const messageAwareness = 1;

export interface CollaborationSetup {
  ydoc: Y.Doc;
  /** The raw WebSocket — use for custom signalling if needed. */
  ws: WebSocket;
  awareness: awarenessProtocol.Awareness;
  /** Tear down the connection and free resources. */
  destroy: () => void;
}

/**
 * Creates a collaboration session for the given article.
 *
 * The WebSocket URL is resolved from NEXT_PUBLIC_COLLAB_WS_URL (default
 * ws://localhost:1234). The articleId is sent as a query parameter so the
 * server can route the client into the correct document room.
 *
 * This function is safe to call in the browser only (uses native WebSocket).
 */
export function createCollaborationProvider(
  articleId: string
): CollaborationSetup {
  const wsUrl =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_COLLAB_WS_URL) ||
    "ws://localhost:1234";

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);

  const url = `${wsUrl}?articleId=${encodeURIComponent(articleId)}`;
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";

  let destroyed = false;

  function sendMessage(data: Uint8Array): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }

  // When the connection opens, send sync step 1 so the server can send us
  // the current document state.
  ws.addEventListener("open", () => {
    if (destroyed) return;

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, ydoc);
    sendMessage(encoding.toUint8Array(encoder));

    // Broadcast our initial awareness state
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, [ydoc.clientID])
    );
    sendMessage(encoding.toUint8Array(awarenessEncoder));
  });

  ws.addEventListener("message", (event: MessageEvent) => {
    if (destroyed) return;

    const data = new Uint8Array(
      event.data instanceof ArrayBuffer
        ? event.data
        : (event.data as Buffer)
    );

    try {
      const decoder = decoding.createDecoder(data);
      const msgType = decoding.readVarUint(decoder);

      if (msgType === messageSync) {
        const replyEncoder = encoding.createEncoder();
        encoding.writeVarUint(replyEncoder, messageSync);
        syncProtocol.readSyncMessage(decoder, replyEncoder, ydoc, ws);
        if (encoding.length(replyEncoder) > 1) {
          sendMessage(encoding.toUint8Array(replyEncoder));
        }
      } else if (msgType === messageAwareness) {
        awarenessProtocol.applyAwarenessUpdate(
          awareness,
          decoding.readVarUint8Array(decoder),
          ws
        );
      }
    } catch (err) {
      console.error("[collab-provider] message error:", err);
    }
  });

  ws.addEventListener("close", () => {
    if (destroyed) return;
    // Mark our own awareness client as removed
    awarenessProtocol.removeAwarenessStates(
      awareness,
      [ydoc.clientID],
      "connection closed"
    );
  });

  ws.addEventListener("error", (err) => {
    console.error("[collab-provider] WebSocket error:", err);
  });

  // When we have local document updates, send them to the server.
  const docUpdateHandler = (update: Uint8Array, origin: unknown) => {
    // Do not echo messages that originated from the server
    if (origin === ws || destroyed) return;

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    sendMessage(encoding.toUint8Array(encoder));
  };
  ydoc.on("update", docUpdateHandler);

  // When local awareness changes, broadcast to the server.
  const awarenessUpdateHandler = (
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    if (origin === ws || destroyed) return;

    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    sendMessage(encoding.toUint8Array(encoder));
  };
  awareness.on("update", awarenessUpdateHandler);

  function destroy(): void {
    if (destroyed) return;
    destroyed = true;

    ydoc.off("update", docUpdateHandler);
    awareness.off("update", awarenessUpdateHandler);

    // Notify peers that this client is leaving
    awarenessProtocol.removeAwarenessStates(
      awareness,
      [ydoc.clientID],
      "provider destroyed"
    );

    awareness.destroy();

    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      ws.close();
    }

    ydoc.destroy();
  }

  return { ydoc, ws, awareness, destroy };
}
