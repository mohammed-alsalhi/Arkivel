"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const INSTALL_DISMISSED_KEY = "arkivel:pwa-install-dismissed";

export default function ServiceWorkerManager() {
  const { addToast } = useToast();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState(() => (typeof navigator === "undefined" ? false : !navigator.onLine));
  const [installDismissed, setInstallDismissed] = useState(() =>
    typeof localStorage === "undefined" ? true : localStorage.getItem(INSTALL_DISMISSED_KEY) === "true",
  );

  const replayQueue = useCallback(() => {
    navigator.serviceWorker?.controller?.postMessage({ type: "REPLAY_QUEUE" });
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        })
        .catch(() => {
          addToast("Offline reading could not be started in this browser.", "warning");
        });
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallDismissed(localStorage.getItem(INSTALL_DISMISSED_KEY) === "true");
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
      localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
      setInstallDismissed(true);
      addToast("Arkivel is installed for quick offline startup.", "success");
    };

    const onOnline = () => {
      setIsOffline(false);
      replayQueue();
      addToast("Connection restored. Queued article saves will retry.", "success");
    };

    const onOffline = () => {
      setIsOffline(true);
      addToast("You are offline. Recently opened pages may still be available.", "warning");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [addToast, replayQueue]);

  const installApp = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "dismissed") {
      localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
      setInstallDismissed(true);
    }
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
    setInstallDismissed(true);
    setInstallPrompt(null);
  };

  if (isOffline) {
    return (
      <div className="fixed inset-x-3 bottom-16 z-50 mx-auto flex max-w-lg items-center justify-between gap-3 rounded border border-border bg-surface px-3 py-2 text-[13px] shadow-lg md:bottom-4">
        <span className="min-w-0 text-foreground">Offline. Cached pages may be stale, and eligible article changes will retry after reconnect.</span>
        <button type="button" className="btn-secondary shrink-0 px-2 py-1 text-[12px]" onClick={replayQueue}>
          Retry
        </button>
      </div>
    );
  }

  if (!installPrompt || installDismissed) return null;

  return (
    <div className="fixed inset-x-3 bottom-16 z-50 mx-auto flex max-w-lg items-center justify-between gap-3 rounded border border-border bg-surface px-3 py-2 text-[13px] shadow-lg md:bottom-4">
      <span className="min-w-0 text-foreground">Install Arkivel for faster startup and offline reading of recently opened pages.</span>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" className="btn-secondary px-2 py-1 text-[12px]" onClick={dismissInstall}>
          Later
        </button>
        <button type="button" className="btn-primary px-2 py-1 text-[12px]" onClick={installApp}>
          Install
        </button>
      </div>
    </div>
  );
}
