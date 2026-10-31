import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapProduct, mapProductList, mapProductQuery } from "@/lib/mappers/product.mapper";
import { pickList } from "@/lib/mappers/utils";

// Mock code is loaded only when mock mode is on, so it never ships to customers.
const mocks = () => import("@/lib/mocks/products");

// productId -> the variant "Add to cart" / the heart uses. Cards only send the product id, but the
// ERP's cart and wishlist work with variant ids, so every product we load is remembered here.
const defaultVariants = new Map();
function remember(products) {
  products.forEach((product) => {
    if (product?.id != null && product.variantId != null) defaultVariants.set(String(product.id), product.variantId);
  });
  return products;
}

/**
 * Product list with filters (POST get-product-list) and the filter options for the same
 * category/search (POST get-filter-view), loaded together.
 * @param {{page?: number, pageSize?: number, search?: string, category?: string, sort?: string,
 *          brands?: string[], minPrice?: number, maxPrice?: number, inStock?: boolean}} [params]
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<import("@/lib/mappers/product.mapper").ProductList>}
 */
async function list(params = {}, { signal } = {}) {
  if (config.useMocks) return (await mocks()).listProducts(params);
  const body = mapProductQuery(params);
  const filterBody = { categoryID: body.categoryID, categorySlug: body.categorySlug, search: body.search };
  const [listResponse, filterView] = await Promise.all([
    apiClient.post(ENDPOINTS.products.list, body, { signal }),
    // The filter panel is a nice-to-have: if it fails, the products still show.
    apiClient
      .post(ENDPOINTS.products.filters, filterBody, { signal })
      .then(unwrap)
      .catch(() => null),
  ]);
  const result = mapProductList(unwrap(listResponse), params, filterView);
  remember(result.items);
  return result;
}

/** GET get-product-details/{idOrSlug} @returns {Promise<import("@/lib/mappers/product.mapper").Product>} */
async function get(idOrSlug, { signal } = {}) {
  if (config.useMocks) return (await mocks()).getProduct(idOrSlug);
  const product = mapProduct(unwrap(await apiClient.get(ENDPOINTS.products.detail(idOrSlug), { signal })));
  remember([product, ...product.related]);
  return product;
}

/**
 * Home page rows: "latest" | "featured" | "bestSelling" | "withVideo" (ERP max 30 per call).
 * Mock mode has no rows: the home page then shows its own demo products.
 * @returns {Promise<import("@/lib/mappers/product.mapper").Product[]>}
 */
async function getRow(kind, count = 12) {
  const path = ENDPOINTS.products[kind];
  if (!path) throw new Error(`Unknown product row: ${kind}`);
  return remember(pickList(unwrap(await apiClient.get(path, { params: { count } }))).map(mapProduct));
}

/**
 * The variant to add when a card only knows the product id: the default variant from any list we
 * already loaded, otherwise looked up from the product's details.
 */
async function defaultVariantId(productId) {
  const known = defaultVariants.get(String(productId));
  if (known != null) return known;
  const product = await get(productId);
  if (product.variantId == null) throw new Error("This product can't be added right now.");
  return product.variantId;
}

/** POST compare-products { productIDs } (up to 4), returned in the same order. Demo: from the demo data. */
async function compare(productIds = []) {
  const ids = productIds.slice(0, 4);
  if (!ids.length) return [];
  if (config.useMocks) {
    const { allProducts } = await import("@/data/products");
    return ids.map((id) => allProducts.find((product) => String(product.id) === String(id))).filter(Boolean);
  }
  return remember(pickList(unwrap(await apiClient.post(ENDPOINTS.products.compare, { productIDs: ids }))).map(mapProduct));
}

export const productService = { list, get, getRow, defaultVariantId, compare };
