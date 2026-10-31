import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapCheckoutSummary, mapOrder, mapPaymentStatus, mapPlaceOrderResult } from "@/lib/mappers/order.mapper";

const mocks = () => import("@/lib/mocks/orders");

// ERP checkout (logged-in customers only for now): saved address -> get-checkout-summary ->
// create-order-from-cart -> online: go to paymentUrl, the gateway returns to /order-complete?order=...

/**
 * Final totals, worked out by the ERP. Call again whenever the address or payment method changes.
 * @param {{paymentMethod?: "cod"|"online", addressId?: string|number, pincode?: string}} [params]
 */
async function getSummary(params = {}) {
  if (config.useMocks) return (await mocks()).getCheckoutSummary(params);
  const body = { addressID: params.addressId, paymentMethod: params.paymentMethod ?? "online" };
  return mapCheckoutSummary(unwrap(await apiClient.post(ENDPOINTS.checkout.summary, body)));
}

/** Delivery check for a pincode. Demo data only: the ERP checks the address in getSummary. */
async function checkPincode(pincode) {
  if (config.useMocks) return (await mocks()).checkPincode(pincode);
  return null;
}

/**
 * Creates the order from the cart (POST create-order-from-cart { addressID, paymentMethod }).
 * Result: { order, payment: { url } | null, paymentError }. COD: payment is null and the order is placed.
 * @param {{paymentMethod: "cod"|"online", addressId?: string|number}} payload
 */
async function placeOrder(payload) {
  if (config.useMocks) return (await mocks()).placeOrder(payload);
  const body = { addressID: payload.addressId, paymentMethod: payload.paymentMethod };
  return mapPlaceOrderResult(unwrap(await apiClient.post(ENDPOINTS.orders.create, body)));
}

/** Demo payment window only (mock mode). The ERP confirms payments itself after the gateway. */
async function verifyPayment(payload) {
  if (config.useMocks) return (await mocks()).verifyPayment(payload);
  return mapOrder(unwrap(await apiClient.get(ENDPOINTS.orders.detail(payload.orderId))));
}

/** GET get-order-payment-status/{orderID}: paymentStatus is paid, pending, failed, cod or cancelled. */
async function getPaymentStatus(orderId) {
  if (config.useMocks) {
    const order = await (await mocks()).getOrder(orderId);
    const paid = order.status !== "pending_payment";
    return { orderId, orderNumber: order.number, paymentStatus: paid ? "paid" : "pending", orderStatus: order.status, isConfirmed: paid, total: order.summary.total, paymentUrl: null };
  }
  return mapPaymentStatus(unwrap(await apiClient.get(ENDPOINTS.orders.paymentStatus(orderId))));
}

/** POST retry-payment/{orderID}: a fresh paymentUrl for an unpaid online order. */
async function retryPayment(orderId) {
  if (config.useMocks) return getPaymentStatus(orderId);
  return mapPaymentStatus(unwrap(await apiClient.post(ENDPOINTS.orders.retryPayment(orderId), {})));
}

export const checkoutService = { getSummary, checkPincode, placeOrder, verifyPayment, getPaymentStatus, retryPayment };
