import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { config } from "@/lib/config";
import { queryKeys } from "@/lib/query/keys";
import { productService } from "@/services/product.service";
import { exploreProducts, festiveProducts } from "@/data/products";

const demoSuggestions = [...festiveProducts, ...exploreProducts];

/**
 * Products to suggest (search popup, search page, cart drawer): the ERP's latest products, or the
 * home page's demo products in mock mode.
 * @example const { data: suggestions = [] } = useSuggestedProducts(8);
 */
export function useSuggestedProducts(count = 12, options = {}) {
  return useQuery({
    queryKey: queryKeys.homeRow(`latest-${count}`),
    queryFn: () => (config.useMocks ? demoSuggestions.slice(0, count) : productService.getRow("latest", count)),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Product list with filters and paging.
 * The previous page stays on screen while the next one loads, so the grid doesn't flash empty.
 * @example const { data, isLoading, error } = useProducts({ page: 1, sort: "price-asc" });
 */
export function useProducts(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: ({ signal }) => productService.list(params, { signal }),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** Products picked for comparing (up to 4), in the order they were added. */
export function useCompareProducts(productIds = [], options = {}) {
  return useQuery({
    queryKey: ["products", "compare", productIds.map(String)],
    queryFn: () => productService.compare(productIds),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** @example const { data: product } = useProduct(slug); */
export function useProduct(idOrSlug, options = {}) {
  return useQuery({
    queryKey: queryKeys.products.detail(idOrSlug),
    queryFn: ({ signal }) => productService.get(idOrSlug, { signal }),
    enabled: idOrSlug !== undefined && idOrSlug !== null && idOrSlug !== "",
    ...options,
  });
}
