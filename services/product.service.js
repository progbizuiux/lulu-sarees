import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapProduct, mapProductList, mapProductQuery } from "@/lib/mappers/product.mapper";

// Mock code is loaded only when mock mode is on, so it never ships to customers.
const mocks = () => import("@/lib/mocks/products");

/**
 * @param {{page?: number, pageSize?: number, search?: string, category?: string, sort?: string,
 *          color?: string, size?: string, minPrice?: number, maxPrice?: number, inStock?: boolean}} [params]
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<import("@/lib/mappers/product.mapper").ProductList>}
 */
async function list(params = {}, { signal } = {}) {
  if (config.useMocks) return (await mocks()).listProducts(params);
  const response = await apiClient.get(ENDPOINTS.products.list, { params: mapProductQuery(params), signal });
  return mapProductList(unwrap(response), params);
}

/** @returns {Promise<import("@/lib/mappers/product.mapper").Product>} */
async function get(idOrSlug, { signal } = {}) {
  if (config.useMocks) return (await mocks()).getProduct(idOrSlug);
  const response = await apiClient.get(ENDPOINTS.products.detail(idOrSlug), { signal });
  return mapProduct(unwrap(response));
}

export const productService = { list, get };
