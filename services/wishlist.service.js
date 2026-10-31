import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapWishlist } from "@/lib/mappers/product.mapper";
import { productService } from "./product.service";

const mocks = () => import("@/lib/mocks/wishlist");

// Guests can use the wishlist too (the ERP keeps it with the pb_cart cookie and joins it into the
// account at login).

/** GET get-wishlist-items @returns {Promise<{productIds: Array<string|number>, items: Array}>} */
async function get() {
  if (config.useMocks) return (await mocks()).getWishlist();
  return mapWishlist(unwrap(await apiClient.get(ENDPOINTS.wishlist.get)));
}

/**
 * Adds a product. The ERP's heart call toggles (POST add-or-remove-wishlist/{variantID}), so it's
 * only sent when the product isn't in the list yet.
 */
async function add(productId) {
  if (config.useMocks) return (await mocks()).addToWishlist(productId);
  const current = await get();
  if (current.productIds.some((id) => String(id) === String(productId))) return current;
  const variantId = await productService.defaultVariantId(productId);
  await apiClient.post(ENDPOINTS.wishlist.toggle(variantId), {});
  return get();
}

/** Removes a product: POST remove-wishlist-item/{wishlistID}, which returns the updated wishlist. */
async function remove(productId) {
  if (config.useMocks) return (await mocks()).removeFromWishlist(productId);
  const current = await get();
  const item = current.items.find((entry) => String(entry.id) === String(productId));
  if (!item?.wishlistId) return current;
  return mapWishlist(unwrap(await apiClient.post(ENDPOINTS.wishlist.remove(item.wishlistId), {})));
}

export const wishlistService = { get, add, remove };
