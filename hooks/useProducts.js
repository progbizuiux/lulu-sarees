import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { productService } from "@/services/product.service";

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

/** @example const { data: product } = useProduct(slug); */
export function useProduct(idOrSlug, options = {}) {
  return useQuery({
    queryKey: queryKeys.products.detail(idOrSlug),
    queryFn: ({ signal }) => productService.get(idOrSlug, { signal }),
    enabled: idOrSlug !== undefined && idOrSlug !== null && idOrSlug !== "",
    ...options,
  });
}
