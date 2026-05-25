import { describe, expect, it } from "vitest";
import {
  createOfflineStaleHeaders,
  getOfflineRouteStrategy,
  mobileStartupChecklist,
  offlinePwaContract,
  shouldQueueOfflineMutation,
} from "../offline-pwa";

describe("offline PWA contract", () => {
  it("classifies cache routes and keeps private surfaces out of caches", () => {
    expect(getOfflineRouteStrategy("/_next/static/chunk.js").strategy).toBe("cache-first");
    expect(getOfflineRouteStrategy("/api/articles/abc").strategy).toBe("network-first");
    expect(getOfflineRouteStrategy("/articles/example").cacheName).toBe("arkivel-pages-v4.88.2");
    expect(getOfflineRouteStrategy("/admin/cache").strategy).toBe("bypass");
  });

  it("queues only safe offline mutations", () => {
    expect(shouldQueueOfflineMutation("/api/articles", "POST")).toBe(true);
    expect(shouldQueueOfflineMutation("/api/categories", "PATCH")).toBe(true);
    expect(shouldQueueOfflineMutation("/api/admin/cache", "POST")).toBe(false);
    expect(shouldQueueOfflineMutation("/api/articles", "GET")).toBe(false);
  });

  it("publishes stale indicators, install metadata, and mobile QA checkpoints", () => {
    expect(offlinePwaContract.fallbackUrl).toBe("/offline.html");
    expect(offlinePwaContract.install.serviceWorker).toBe("/sw.js");
    expect(offlinePwaContract.staleIndicators).toContain("X-Arkivel-Cache-Stale");
    expect(mobileStartupChecklist.map((checkpoint) => checkpoint.id)).toEqual(
      expect.arrayContaining(["standalone-launch", "offline-reading", "install-prompt", "retry-replay"]),
    );
  });

  it("creates offline stale response headers", () => {
    expect(createOfflineStaleHeaders("2026-05-25T12:00:00.000Z")).toEqual({
      "X-Arkivel-Cache-Stale": "true",
      "X-Arkivel-Cached-At": "2026-05-25T12:00:00.000Z",
      "X-Arkivel-Offline": "true",
    });
  });
});
