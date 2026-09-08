import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  params?: Record<string, string>;
};

export default function Pagination({ currentPage, totalPages, baseUrl, params = {} }: Props) {
  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const sp = new URLSearchParams(params);
    sp.set("page", page.toString());
    return `${baseUrl}?${sp}`;
  }

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex items-center gap-1 mt-4 text-[13px]" aria-label="Pagination">
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)} className="px-2 py-1 border border-border bg-surface hover:bg-surface-hover">
          Prev
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-muted">...</span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            className={`px-2 py-1 border ${
              p === currentPage
                ? "border-accent bg-accent text-white font-bold"
                : "border-border bg-surface hover:bg-surface-hover"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)} className="px-2 py-1 border border-border bg-surface hover:bg-surface-hover">
          Next
        </Link>
      )}
    </nav>
  );
}
