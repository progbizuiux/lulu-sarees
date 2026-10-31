import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapOrder, mapOrderList } from "@/lib/mappers/order.mapper";

const mocks = () => import("@/lib/mocks/orders");

// The orders page has no paging yet, so it asks for the latest 50 orders.
const ORDERS_PAGE_SIZE = 50;

/** POST get-orders-list { page, pageSize } @returns {Promise<import("@/lib/mappers/order.mapper").Order[]>} */
async function list() {
  if (config.useMocks) return (await mocks()).listOrders();
  return mapOrderList(unwrap(await apiClient.post(ENDPOINTS.orders.list, { page: 1, pageSize: ORDERS_PAGE_SIZE })));
}

/** GET fetch-order-details/{orderID} @returns {Promise<import("@/lib/mappers/order.mapper").Order>} */
async function get(orderId) {
  if (config.useMocks) return (await mocks()).getOrder(orderId);
  return mapOrder(unwrap(await apiClient.get(ENDPOINTS.orders.detail(orderId))));
}

/**
 * Public order tracking (no login): GET track-order?orderNo=&phone= (the mobile number on the order).
 * @param {{orderNumber: string, contact: string}} payload  contact = mobile number
 * @returns {Promise<import("@/lib/mappers/order.mapper").Order>}
 */
async function track({ orderNumber, contact }) {
  if (config.useMocks) return (await mocks()).trackOrder({ orderNumber, contact });
  return mapOrder(unwrap(await apiClient.get(ENDPOINTS.orders.track, { params: { orderNo: orderNumber, phone: contact } })));
}

/** POST cancel-order { orderID, reason }. Only offered when the order says canCancel. */
async function cancel(orderId, reason) {
  if (config.useMocks) return { message: "Order cancelled (demo)." };
  return unwrap(await apiClient.post(ENDPOINTS.orders.cancel, { orderID: orderId, reason: reason || undefined }));
}

export const orderService = { list, get, track, cancel };
