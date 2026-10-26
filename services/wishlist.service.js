import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapWishlist } from "@/lib/mappers/product.mapper";

const mocks = () => import("@/lib/mocks/wishlist");

/** @returns {Promise<{productIds: Array<string|number>, items: import("@/lib/mappers/product.mapper").Product[]}>} */
async function get() {
  if (config.useMocks) return (await mocks()).getWishlist();
  return mapWishlist(unwrap(await apiClient.get(ENDPOINTS.wishlist.get)));
}

async function wishlistFrom(response) {
  const data = unwrap(response);
  return data ? mapWishlist(data) : get();
}

async function add(productId) {
  if (config.useMocks) return (await mocks()).addToWishlist(productId);
  return wishlistFrom(await apiClient.post(ENDPOINTS.wishlist.item(productId)));
}

async function remove(productId) {
  if (config.useMocks) return (await mocks()).removeFromWishlist(productId);
  return wishlistFrom(await apiClient.delete(ENDPOINTS.wishlist.item(productId)));
}

export const wishlistService = { get, add, remove };
