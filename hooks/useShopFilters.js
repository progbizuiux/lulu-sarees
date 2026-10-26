import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EMPTY_FILTERS, readFilters, toQueryString } from "@/lib/shop/filters";

/**
 * Reads and changes the shop filters in the URL.
 * Components using this must sit inside <Suspense> (Next.js requires it for useSearchParams).
 *
 * @example
 * const { filters, setFilters, clearFilters } = useShopFilters();
 * setFilters({ color: "Red" });          // also goes back to page 1
 * setFilters({ page: 2 });
 */
export function useShopFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (changes) => {
      // Any filter change starts again from page 1, unless the change is the page itself.
      const next = { ...filters, ...changes, page: "page" in changes ? changes.page : 1 };
      const query = toQueryString(next);
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router]
  );

  // Keeps the category and search (they come from the menu and the search box) and the sort order.
  const clearFilters = useCallback(
    () =>
      setFilters({ ...EMPTY_FILTERS, category: filters.category, search: filters.search, sort: filters.sort }),
    [filters.category, filters.search, filters.sort, setFilters]
  );

  /** Link to another page of the same results (real links, so search engines can follow them). */
  const pageHref = useCallback(
    (page) => {
      const query = toQueryString({ ...filters, page });
      return query ? `${pathname}?${query}` : pathname;
    },
    [filters, pathname]
  );

  return { filters, setFilters, clearFilters, pageHref };
}
