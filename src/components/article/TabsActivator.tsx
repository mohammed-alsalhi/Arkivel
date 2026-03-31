"use client";
import { useEffect } from "react";

/**
 * Activates wiki-tabs interactive behaviour on article pages.
 * Attaches click handlers to .wiki-tab-btn elements after mount.
 */
export default function TabsActivator() {
  useEffect(() => {
    function activate(root: Document | Element) {
      root.querySelectorAll<HTMLElement>(".wiki-tabs[data-tabs]").forEach((tabs) => {
        if (tabs.dataset.tabsReady) return;
        tabs.dataset.tabsReady = "1";

        const buttons = tabs.querySelectorAll<HTMLElement>(".wiki-tab-btn");
        const panels = tabs.querySelectorAll<HTMLElement>(".wiki-tab-panel");

        buttons.forEach((btn) => {
          btn.addEventListener("click", () => {
            const idx = btn.dataset.tab ?? "0";
            buttons.forEach((b) => b.classList.toggle("active", b.dataset.tab === idx));
            panels.forEach((p) => p.classList.toggle("active", p.dataset.panel === idx));
          });
        });
      });
    }

    activate(document);
  }, []);

  return null;
}
