"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

type Translation = {
  id: string;
  locale: string;
  title: string;
};

const LOCALE_LABELS: Record<string, { name: string; flag: string }> = {
  en: { name: "English", flag: "EN" },
  fr: { name: "French", flag: "FR" },
  de: { name: "German", flag: "DE" },
  es: { name: "Spanish", flag: "ES" },
  it: { name: "Italian", flag: "IT" },
  pt: { name: "Portuguese", flag: "PT" },
  ar: { name: "Arabic", flag: "AR" },
  zh: { name: "Chinese", flag: "ZH" },
  ja: { name: "Japanese", flag: "JA" },
  ko: { name: "Korean", flag: "KO" },
  ru: { name: "Russian", flag: "RU" },
  hi: { name: "Hindi", flag: "HI" },
  tr: { name: "Turkish", flag: "TR" },
  nl: { name: "Dutch", flag: "NL" },
  sv: { name: "Swedish", flag: "SV" },
  pl: { name: "Polish", flag: "PL" },
};

function getLocaleLabel(locale: string) {
  return LOCALE_LABELS[locale] || { name: locale, flag: locale.toUpperCase() };
}

export default function LanguageSwitcher({ articleId }: { articleId: string }) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const currentLocale = searchParams.get("locale") || null;

  useEffect(() => {
    fetch(`/api/articles/${articleId}/translations`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTranslations(data);
      })
      .catch(() => {});
  }, [articleId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (translations.length === 0) return null;

  // Build URL with locale param
  function buildUrl(locale: string | null) {
    const url = new URL(window.location.href);
    if (locale) {
      url.searchParams.set("locale", locale);
    } else {
      url.searchParams.delete("locale");
    }
    return url.pathname + url.search;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-[12px] text-muted border border-border-light px-2 py-0.5 hover:bg-surface-hover"
        title="Available translations"
      >
        {currentLocale
          ? getLocaleLabel(currentLocale).flag
          : "Original"}{" "}
        <span className="text-[10px]">{"\u25BC"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border shadow-md min-w-[160px]">
          {/* Original language */}
          <a
            href={buildUrl(null)}
            className={`block px-3 py-1.5 text-[12px] hover:bg-surface-hover ${
              !currentLocale ? "font-bold text-accent" : "text-foreground"
            }`}
            onClick={() => setOpen(false)}
          >
            Original
          </a>

          {/* Available translations */}
          {translations.map((t) => {
            const label = getLocaleLabel(t.locale);
            return (
              <a
                key={t.locale}
                href={buildUrl(t.locale)}
                className={`block px-3 py-1.5 text-[12px] hover:bg-surface-hover ${
                  currentLocale === t.locale ? "font-bold text-accent" : "text-foreground"
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="font-mono text-[11px] mr-1.5">{label.flag}</span>
                {label.name}
                <span className="text-muted text-[11px] ml-1">({t.title})</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
