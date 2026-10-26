import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapCheckoutSummary, mapOrder, mapPincodeCheck, mapPlaceOrderResult } from "@/lib/mappers/order.mapper";
import { compact } from "@/lib/mappers/utils";

const mocks = () => import("@/lib/mocks/orders");

/**
 * Final totals for the checkout page, worked out by the backend.
 * Call again whenever the cart, coupon, address or payment method changes.
 * @param {{paymentMethod?: "cod"|"online", addressId?: string|number, pincode?: string}} [params]
 * @returns {Promise<import("@/lib/mappers/order.mapper").CheckoutSummary>}
 */
async function getSummary(params = {}) {
  if (config.useMocks) return (await mocks()).getCheckoutSummary(params);
  const response = await apiClient.get(ENDPOINTS.checkout.summary, { params: compact(params) });
  return mapCheckoutSummary(unwrap(response));
}

/** Can we deliver to this pincode, and is COD available there? */
async function checkPincode(pincode) {
  if (config.useMocks) return (await mocks()).checkPincode(pincode);
  const response = await apiClient.get(ENDPOINTS.checkout.pincode, { params: { pincode } });
  return mapPincodeCheck(unwrap(response), pincode);
}

/**
 * Creates the order. For online payment the result includes `payment` details for the gateway popup;
 * for COD `payment` is null and the order is already confirmed.
 * @param {{paymentMethod: "cod"|"online", addressId?: string|number, address?: Object}} payload
 */
async function placeOrder(payload) {
  if (config.useMocks) return (await mocks()).placeOrder(payload);
  return mapPlaceOrderResult(unwrap(await apiClient.post(ENDPOINTS.orders.create, payload)));
}

/**
 * Sends the gateway's response to the backend, which checks the signature and confirms the order.
 * The frontend never decides on its own that a payment succeeded.
 * @param {{orderId: string|number, gatewayOrderId?: string, gatewayPaymentId?: string, signature?: string}} payload
 */
async function verifyPayment(payload) {
  if (config.useMocks) return (await mocks()).verifyPayment(payload);
  return mapOrder(unwrap(await apiClient.post(ENDPOINTS.orders.verifyPayment, payload)));
}

export const checkoutService = { getSummary, checkPincode, placeOrder, verifyPayment };
