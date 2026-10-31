import { apiClient, unwrap } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapCart } from "@/lib/mappers/cart.mapper";
import { productService } from "./product.service";

const mocks = () => import("@/lib/mocks/cart");

// Every ERP cart call returns the full, updated cart (lines + subtotal). Guests get a pb_cart cookie
// on their first add; at login or sign-up the ERP joins the guest cart into the account's cart.

/** GET get-cart-items @returns {Promise<import("@/lib/mappers/cart.mapper").Cart>} */
async function get() {
  if (config.useMocks) return (await mocks()).getCart();
  return mapCart(unwrap(await apiClient.get(ENDPOINTS.cart.get)));
}

/**
 * POST add-to-cart { variantID, quantity }. If the variant is already in the cart, the ERP adds
 * `quantity` to that line. Cards only know the product id, so its default variant is looked up.
 * @param {{productId: string|number, variantId?: string|number|null, quantity?: number}} item
 */
async function addItem({ productId, variantId = null, quantity = 1 }) {
  if (config.useMocks) return (await mocks()).addItem({ productId, variantId, quantity });
  const variantID = variantId ?? (await productService.defaultVariantId(productId));
  return mapCart(unwrap(await apiClient.post(ENDPOINTS.cart.add, { variantID, quantity })));
}

/** POST update-cart-quantity { cartID, quantity } (0 removes the line). itemId = the line's cartID. */
async function updateItem(itemId, quantity) {
  if (config.useMocks) return (await mocks()).updateItem(itemId, quantity);
  return mapCart(unwrap(await apiClient.post(ENDPOINTS.cart.update, { cartID: itemId, quantity })));
}

/** POST remove-cart-item { cartID } */
async function removeItem(itemId) {
  if (config.useMocks) return (await mocks()).removeItem(itemId);
  return mapCart(unwrap(await apiClient.post(ENDPOINTS.cart.remove, { cartID: itemId })));
}

/** Empties the cart. The ERP has no "clear" call, so each line is removed in turn. */
async function clear() {
  if (config.useMocks) return (await mocks()).emptyCart();
  let cart = await get();
  for (const item of cart.items) {
    cart = await removeItem(item.id);
  }
  return cart;
}

// ---- Coupons: not in the ERP yet (handover, "Not available yet"). The coupon boxes are hidden on the
// real API (config.features.coupons); these answers are only a safety net.
const NO_COUPONS = "Coupons aren't available yet.";

async function applyCoupon(code) {
  if (config.useMocks) return (await mocks()).applyCoupon(code);
  throw new ApiError({ message: NO_COUPONS, status: 400 });
}

async function removeCoupon() {
  if (config.useMocks) return (await mocks()).removeCoupon();
  return get();
}

/** @returns {Promise<import("@/lib/mappers/cart.mapper").Coupon[]>} */
async function getAvailableCoupons() {
  if (config.useMocks) return (await mocks()).getAvailableCoupons();
  return [];
}

export const cartService = {
  get,
  addItem,
  updateItem,
  removeItem,
  clear,
  applyCoupon,
  removeCoupon,
  getAvailableCoupons,
};
