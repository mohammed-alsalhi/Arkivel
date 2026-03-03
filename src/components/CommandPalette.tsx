"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/components/AdminContext";
import { getCommands, type Command } from "@/lib/commands";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: { name: string; icon?: string | null } | null;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [articleResults, setArticleResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isAdminUser = useAdmin();

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";
    html.classList.add("theme-transitioning");
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setTimeout(() => html.classList.remove("theme-transitioning"), 300);
  }, []);

  const allCommands = useMemo(
    () => getCommands(router, toggleTheme),
    [router, toggleTheme]
  );

  // Filter commands based on admin status and query
  const filteredCommands = useMemo(() => {
    const available = allCommands.filter(
      (cmd) => !cmd.adminOnly || isAdminUser
    );
    if (!query.trim()) return available;

    const q = query.toLowerCase();
    return available.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.group.toLowerCase().includes(q) ||
        cmd.keywords?.some((kw) => kw.includes(q))
    );
  }, [allCommands, isAdminUser, query]);

  // All selectable items: commands + article search results
  const allItems = useMemo(() => {
    const items: { type: "command" | "article"; data: Command | SearchResult }[] =
      filteredCommands.map((cmd) => ({ type: "command", data: cmd }));

    articleResults.forEach((result) => {
      items.push({ type: "article", data: result });
    });

    return items;
  }, [filteredCommands, articleResults]);

  // Search articles when query > 2 chars
  useEffect(() => {
    if (query.trim().length <= 2) {
      setArticleResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&limit=5`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setArticleResults(data);
        }
      } catch {
        // Aborted or network error — ignore
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allItems.length]);

  // Open/close on Ctrl+K / Cmd+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input on open, reset on close
  useEffect(() => {
    if (open) {
      setQuery("");
      setArticleResults([]);
      setSelectedIndex(0);
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Execute the selected item
  const executeItem = useCallback(
    (index: number) => {
      const item = allItems[index];
      if (!item) return;

      setOpen(false);
      if (item.type === "command") {
        (item.data as Command).action();
      } else {
        router.push(`/wiki/${(item.data as SearchResult).slug}`);
      }
    },
    [allItems, router]
  );

  // Keyboard navigation inside the palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : allItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          executeItem(selectedIndex);
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [allItems.length, selectedIndex, executeItem]
  );

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector(`[data-index="${selectedIndex}"]`);
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  // Group commands by category for display
  const commandGroups = new Map<string, Command[]>();
  filteredCommands.forEach((cmd) => {
    const list = commandGroups.get(cmd.group) || [];
    list.push(cmd);
    commandGroups.set(cmd.group, list);
  });

  // Build a flat index tracker to map group display to allItems index
  let flatIndex = 0;

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="command-palette-input-wrapper">
          <svg
            className="command-palette-search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="command-palette-esc">Esc</kbd>
        </div>

        {/* Results list */}
        <div className="command-palette-list" ref={listRef}>
          {/* Command groups */}
          {Array.from(commandGroups.entries()).map(([group, commands]) => (
            <div key={group} className="command-palette-group">
              <div className="command-palette-group-title">{group}</div>
              {commands.map((cmd) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={cmd.id}
                    data-index={idx}
                    className={`command-palette-item ${
                      idx === selectedIndex ? "command-palette-item-active" : ""
                    }`}
                    onClick={() => executeItem(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className="command-palette-item-label">
                      {cmd.label}
                    </span>
                    {cmd.shortcut && (
                      <span className="command-palette-item-shortcut">
                        {cmd.shortcut.split(" ").map((k, i) => (
                          <kbd key={i}>{k}</kbd>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Article search results */}
          {articleResults.length > 0 && (
            <div className="command-palette-group">
              <div className="command-palette-group-title">Articles</div>
              {articleResults.map((result) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={result.id}
                    data-index={idx}
                    className={`command-palette-item ${
                      idx === selectedIndex ? "command-palette-item-active" : ""
                    }`}
                    onClick={() => executeItem(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className="command-palette-item-label">
                      {result.title}
                    </span>
                    {result.category && (
                      <span className="command-palette-item-category">
                        {result.category.icon} {result.category.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading state */}
          {searchLoading && query.trim().length > 2 && (
            <div className="command-palette-loading">Searching articles...</div>
          )}

          {/* Empty state */}
          {allItems.length === 0 && !searchLoading && (
            <div className="command-palette-empty">
              No matching commands or articles found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
