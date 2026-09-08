import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { createServer } from "http";

const PORT = Number(process.env.COLLAB_PORT) || 1234;

// Message type constants from y-protocols
const messageSync = 0;
const messageAwareness = 1;

// In-memory stores
const docs = new Map<string, Y.Doc>();
const rooms = new Map<string, Set<WebSocket>>();

// Map to track which doc belongs to which WebSocket
const connToArticle = new Map<WebSocket, string>();
const connToAwareness = new Map<WebSocket, awarenessProtocol.Awareness>();

function getOrCreateDoc(articleId: string): Y.Doc {
  let doc = docs.get(articleId);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(articleId, doc);
  }
  return doc;
}

function getOrCreateRoom(articleId: string): Set<WebSocket> {
  let room = rooms.get(articleId);
  if (!room) {
    room = new Set();
    rooms.set(articleId, room);
  }
  return room;
}

function send(conn: WebSocket, message: Uint8Array): void {
  if (conn.readyState === WebSocket.OPEN) {
    conn.send(message, (err) => {
      if (err) {
        console.error("[collab] send error:", err);
      }
    });
  }
}

function broadcastToRoom(
  articleId: string,
  message: Uint8Array,
  exclude?: WebSocket
): void {
  const room = rooms.get(articleId);
  if (!room) return;
  for (const client of room) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      send(client, message);
    }
  }
}

function setupConnection(conn: WebSocket, articleId: string): void {
  const doc = getOrCreateDoc(articleId);
  const room = getOrCreateRoom(articleId);

  room.add(conn);
  connToArticle.set(conn, articleId);

  const awareness = new awarenessProtocol.Awareness(doc);
  connToAwareness.set(conn, awareness);

  // Send initial sync step 1 (our state vector) to the new client
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  send(conn, encoding.toUint8Array(encoder));

  // Send current awareness states to the new client
  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        Array.from(awarenessStates.keys())
      )
    );
    send(conn, encoding.toUint8Array(awarenessEncoder));
  }

  // Listen for doc updates and broadcast to room
  const docUpdateHandler = (update: Uint8Array, origin: unknown) => {
    // Do not echo back to the originating connection
    if (origin === conn) return;

    const updateEncoder = encoding.createEncoder();
    encoding.writeVarUint(updateEncoder, messageSync);
    syncProtocol.writeUpdate(updateEncoder, update);
    broadcastToRoom(articleId, encoding.toUint8Array(updateEncoder), conn);
  };
  doc.on("update", docUpdateHandler);

  // Listen for awareness updates and broadcast
  const awarenessUpdateHandler = (
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown
  ) => {
    if (origin === conn) return;

    const changedClients = added.concat(updated, removed);
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    broadcastToRoom(articleId, encoding.toUint8Array(awarenessEncoder), conn);
  };
  awareness.on("update", awarenessUpdateHandler);

  conn.on("message", (rawMessage: Buffer | ArrayBuffer | Buffer[]) => {
    let data: Uint8Array;
    if (rawMessage instanceof Buffer) {
      data = new Uint8Array(rawMessage);
    } else if (rawMessage instanceof ArrayBuffer) {
      data = new Uint8Array(rawMessage);
    } else {
      // Buffer[]
      data = new Uint8Array(Buffer.concat(rawMessage as Buffer[]));
    }

    try {
      const decoder = decoding.createDecoder(data);
      const msgType = decoding.readVarUint(decoder);

      if (msgType === messageSync) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);

        const syncMessageType = syncProtocol.readSyncMessage(
          decoder,
          encoder,
          doc,
          conn
        );

        // If we produced a response (sync step 2 or update ack), send it back
        if (encoding.length(encoder) > 1) {
          send(conn, encoding.toUint8Array(encoder));
        }

        // If the client sent an update (type 2), broadcast to room
        if (syncMessageType === syncProtocol.messageYjsUpdate) {
          const broadcastEncoder = encoding.createEncoder();
          encoding.writeVarUint(broadcastEncoder, messageSync);
          // Re-encode the update for broadcast
          const updateDecoder = decoding.createDecoder(data);
          decoding.readVarUint(updateDecoder); // skip message type
          syncProtocol.readSyncMessage(
            updateDecoder,
            broadcastEncoder,
            doc,
            conn
          );
          if (encoding.length(broadcastEncoder) > 1) {
            broadcastToRoom(
              articleId,
              encoding.toUint8Array(broadcastEncoder),
              conn
            );
          }
        }
      } else if (msgType === messageAwareness) {
        const awarenessUpdate = decoding.readVarUint8Array(decoder);
        awarenessProtocol.applyAwarenessUpdate(awareness, awarenessUpdate, conn);

        // Broadcast awareness update to all other clients in room
        const broadcastEncoder = encoding.createEncoder();
        encoding.writeVarUint(broadcastEncoder, messageAwareness);
        encoding.writeVarUint8Array(broadcastEncoder, awarenessUpdate);
        broadcastToRoom(
          articleId,
          encoding.toUint8Array(broadcastEncoder),
          conn
        );
      }
    } catch (err) {
      console.error("[collab] message handling error:", err);
    }
  });

  conn.on("close", () => {
    const articleId = connToArticle.get(conn);
    if (!articleId) return;

    // Remove from room
    const room = rooms.get(articleId);
    if (room) {
      room.delete(conn);
      if (room.size === 0) {
        rooms.delete(articleId);
        // Optionally keep the doc in memory or clean it up
        // For now, keep docs alive so state persists across reconnects in the same process
      }
    }

    // Mark the awareness client as disconnected
    const awareness = connToAwareness.get(conn);
    if (awareness) {
      awarenessProtocol.removeAwarenessStates(
        awareness,
        [doc.clientID],
        "connection closed"
      );
      awareness.destroy();
    }

    // Remove listener cleanup
    doc.off("update", docUpdateHandler);
    awareness?.off("update", awarenessUpdateHandler);

    connToArticle.delete(conn);
    connToAwareness.delete(conn);
  });

  conn.on("error", (err) => {
    console.error(`[collab] connection error for article ${articleId}:`, err);
  });
}

// Create HTTP + WebSocket server
const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Collaboration WebSocket server\n");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  // Extract articleId from URL query string: ws://host:port/?articleId=xyz
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const articleId = url.searchParams.get("articleId") ?? url.pathname.replace(/^\//, "");

  if (!articleId) {
    console.warn("[collab] connection rejected: no articleId");
    ws.close(4000, "articleId required");
    return;
  }

  console.log(`[collab] client connected to article: ${articleId}`);
  setupConnection(ws, articleId);
});

wss.on("error", (err) => {
  console.error("[collab] WebSocketServer error:", err);
});

server.listen(PORT, () => {
  console.log(`[collab] Collaboration server running on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("[collab] Shutting down...");
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

process.on("SIGTERM", () => {
  console.log("[collab] Shutting down...");
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
