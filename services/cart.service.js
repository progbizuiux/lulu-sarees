import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapCart, mapCoupons } from "@/lib/mappers/cart.mapper";

const mocks = () => import("@/lib/mocks/cart");

// Every cart call returns the full, updated cart (items + totals) calculated by the backend.
// If a real endpoint returns nothing, the cart is fetched again so the UI is never out of date.
async function cartFrom(response) {
  const data = unwrap(response);
  return data ? mapCart(data) : get();
}

/** @returns {Promise<import("@/lib/mappers/cart.mapper").Cart>} */
async function get() {
  if (config.useMocks) return (await mocks()).getCart();
  return mapCart(unwrap(await apiClient.get(ENDPOINTS.cart.get)));
}

/** @param {{productId: string|number, variantId?: string|number|null, quantity?: number}} item */
async function addItem({ productId, variantId = null, quantity = 1 }) {
  if (config.useMocks) return (await mocks()).addItem({ productId, variantId, quantity });
  return cartFrom(await apiClient.post(ENDPOINTS.cart.items, { productId, variantId, quantity }));
}

async function updateItem(itemId, quantity) {
  if (config.useMocks) return (await mocks()).updateItem(itemId, quantity);
  return cartFrom(await apiClient.patch(ENDPOINTS.cart.item(itemId), { quantity }));
}

async function removeItem(itemId) {
  if (config.useMocks) return (await mocks()).removeItem(itemId);
  return cartFrom(await apiClient.delete(ENDPOINTS.cart.item(itemId)));
}

async function applyCoupon(code) {
  if (config.useMocks) return (await mocks()).applyCoupon(code);
  return cartFrom(await apiClient.post(ENDPOINTS.cart.coupon, { code: String(code).trim() }));
}

async function removeCoupon() {
  if (config.useMocks) return (await mocks()).removeCoupon();
  return cartFrom(await apiClient.delete(ENDPOINTS.cart.coupon));
}

/** @returns {Promise<import("@/lib/mappers/cart.mapper").Coupon[]>} */
async function getAvailableCoupons() {
  if (config.useMocks) return (await mocks()).getAvailableCoupons();
  return mapCoupons(unwrap(await apiClient.get(ENDPOINTS.cart.availableCoupons)));
}

export const cartService = { get, addItem, updateItem, removeItem, applyCoupon, removeCoupon, getAvailableCoupons };
