"use client";

import { useEffect } from "react";

/**
 * After mount, finds all headings inside #article-content and injects a
 * clickable ¶ anchor link that copies the heading URL to the clipboard.
 */
export default function HeadingPermalinks() {
  useEffect(() => {
    const container = document.getElementById("article-content");
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h1,h2,h3,h4,h5,h6")) as HTMLElement[];

    const links: HTMLAnchorElement[] = [];

    for (const heading of headings) {
      if (heading.dataset.permalinkAttached) continue;
      heading.dataset.permalinkAttached = "1";
      heading.style.position = "relative";

      const id = heading.id;
      if (!id) continue;

      const link = document.createElement("a");
      link.href = `#${id}`;
      link.className = "heading-permalink";
      link.setAttribute("aria-label", "Permalink to this section");
      link.textContent = "¶";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const url = `${location.origin}${location.pathname}#${id}`;
        navigator.clipboard.writeText(url).catch(() => {});
        history.pushState(null, "", `#${id}`);
      });

      heading.appendChild(link);
      links.push(link);
    }

    return () => {
      for (const link of links) link.remove();
    };
  }, []);

  return null;
}
