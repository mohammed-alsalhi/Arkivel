export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const TRANSITION_CLASS = "theme-transitioning";
const TRANSITION_MS = 300;

/**
 * The theme currently applied to the document. The bootstrap script in
 * layout.tsx sets `data-theme` before first paint, so this reflects reality
 * as soon as the DOM exists.
 */
export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** Persist and apply a theme, cross-fading every surface at the same rate. */
export function setTheme(theme: Theme) {
  const root = document.documentElement;
  localStorage.setItem(STORAGE_KEY, theme);
  root.classList.add(TRANSITION_CLASS);
  root.setAttribute("data-theme", theme);
  setTimeout(() => {
    root.classList.remove(TRANSITION_CLASS);
  }, TRANSITION_MS);
}

/** Flip between light and dark; returns the theme that is now active. */
export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
