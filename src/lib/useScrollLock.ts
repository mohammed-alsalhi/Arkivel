"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";
let lockedShell: HTMLElement | null = null;
let previousShellOverflow = "";

/**
 * Locks page scrolling while `locked` is true. Reference-counted so nested
 * overlays (drawer + modal) don't unlock the page when the inner one closes.
 *
 * In product mode the body is the scroll container, so locking body overflow
 * is enough. In wiki mode the body is already `overflow: hidden` and the real
 * scroll container is `.wiki-content-shell`, so that element gets locked too.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const shell = document.querySelector<HTMLElement>(".wiki-content-shell");
      if (shell) {
        lockedShell = shell;
        previousShellOverflow = shell.style.overflow;
        shell.style.overflow = "hidden";
      }
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
        if (lockedShell) {
          lockedShell.style.overflow = previousShellOverflow;
          lockedShell = null;
        }
      }
    };
  }, [locked]);
}
