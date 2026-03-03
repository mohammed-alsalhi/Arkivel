"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { SlashCommandItem } from "./SlashCommandExtension";

export type SlashCommandMenuRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type Props = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  clientRect?: (() => DOMRect | null) | null;
};

const SlashCommandMenu = forwardRef<SlashCommandMenuRef, Props>(
  function SlashCommandMenu({ items, command, clientRect }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Reset selection when items change
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    // Scroll selected item into view
    useEffect(() => {
      const el = itemRefs.current[selectedIndex];
      if (el) {
        el.scrollIntoView({ block: "nearest" });
      }
    }, [selectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) =>
            prev <= 0 ? items.length - 1 : prev - 1
          );
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) =>
            prev >= items.length - 1 ? 0 : prev + 1
          );
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }

        if (event.key === "Escape") {
          return true;
        }

        return false;
      },
    }));

    // Compute position from clientRect
    const rect = clientRect?.();
    if (!rect) return null;

    if (items.length === 0) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        className="fixed z-[9999] max-h-[300px] w-[280px] overflow-y-auto border border-border bg-surface shadow-md"
        style={{
          top: rect.bottom + 4,
          left: rect.left,
        }}
      >
        {items.map((item, index) => (
          <button
            key={item.title}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            className={`flex w-full flex-col px-3 py-2 text-left transition-colors ${
              index === selectedIndex
                ? "bg-surface-hover text-foreground"
                : "text-foreground hover:bg-surface-hover"
            }`}
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault();
              selectItem(index);
            }}
          >
            <span className="text-[13px] font-medium">{item.title}</span>
            <span className="text-[11px] text-muted">{item.description}</span>
          </button>
        ))}
      </div>
    );
  }
);

export default SlashCommandMenu;
