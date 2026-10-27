import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapOrder, mapOrderList } from "@/lib/mappers/order.mapper";

const mocks = () => import("@/lib/mocks/orders");

/** @returns {Promise<import("@/lib/mappers/order.mapper").Order[]>} */
async function list() {
  if (config.useMocks) return (await mocks()).listOrders();
  return mapOrderList(unwrap(await apiClient.get(ENDPOINTS.orders.list)));
}

/** @returns {Promise<import("@/lib/mappers/order.mapper").Order>} */
async function get(orderId) {
  if (config.useMocks) return (await mocks()).getOrder(orderId);
  return mapOrder(unwrap(await apiClient.get(ENDPOINTS.orders.detail(orderId))));
}

/**
 * Public order tracking (no login): order number + the email or phone used for the order.
 * @param {{orderNumber: string, contact: string}} payload
 * @returns {Promise<import("@/lib/mappers/order.mapper").Order>}
 */
async function track(payload) {
  if (config.useMocks) return (await mocks()).trackOrder(payload);
  return mapOrder(unwrap(await apiClient.post(ENDPOINTS.orders.track, payload)));
}

export const orderService = { list, get, track };
