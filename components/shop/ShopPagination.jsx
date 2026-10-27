"use client";
import Link from "next/link";

// Page numbers to show: always the first and last, and two either side of the current page.
// e.g. page 6 of 20 -> 1 … 4 5 6 7 8 … 20
function pageWindow(page, totalPages) {
  const pages = new Set([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p++) if (p >= 1 && p <= totalPages) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap", p] : [p]));
}

/**
 * Pagination using real links (?page=2), so pages can be opened in a new tab and search engines
 * can follow them. Render inside <ul className="wg-pagination">.
 */
export default function ShopPagination({ page, totalPages, pageHref }) {
  if (!totalPages || totalPages <= 1) return null;

  const arrow = (target, icon, label, disabled) => (
    <li>
      {disabled ? (
        <span className="pagination-item text-button disabled" aria-disabled="true" aria-label={label}>
          <i className={icon} />
        </span>
      ) : (
        <Link href={pageHref(target)} className="pagination-item text-button" aria-label={label}>
          <i className={icon} />
        </Link>
      )}
    </li>
  );

  return (
    <>
      {arrow(page - 1, "icon-arrLeft", "Previous page", page <= 1)}
      {pageWindow(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <li key={`gap-${i}`} aria-hidden="true">
            <span className="pagination-item text-button">…</span>
          </li>
        ) : (
          <li key={p} className={p === page ? "active" : ""}>
            <Link
              href={pageHref(p)}
              className="pagination-item text-button"
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </Link>
          </li>
        )
      )}
      {arrow(page + 1, "icon-arrRight", "Next page", page >= totalPages)}
    </>
  );
}
