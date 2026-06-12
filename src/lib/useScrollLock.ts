"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";

/**
 * Locks body scrolling while `locked` is true. Reference-counted so nested
 * overlays (drawer + modal) don't unlock the body when the inner one closes.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [locked]);
}
