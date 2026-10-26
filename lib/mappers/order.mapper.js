import { mapCartItem, mapTotals } from "./cart.mapper";
import { num, pickList } from "./utils";

/**
 * @typedef {Object} Order
 * @property {string|number} id
 * @property {string} number        order number shown to the customer
 * @property {string} createdAt     ISO date
 * @property {string} status        e.g. "pending_payment", "confirmed", "shipped"
 * @property {"cod"|"online"} paymentMethod
 * @property {import("./cart.mapper").CartItem[]} items
 * @property {import("./cart.mapper").Totals} summary
 * @property {Object|null} address
 */

/**
 * @typedef {Object} CheckoutSummary
 * @property {import("./cart.mapper").CartItem[]} items
 * @property {import("./cart.mapper").Totals} summary
 * @property {boolean} codAvailable
 * @property {string[]} messages
 */

/** @returns {Order|null} */
export function mapOrder(api) {
  if (!api) return null;

  return {
    id: api.id ?? api.orderId,
    number: String(api.orderNumber ?? api.number ?? api.id ?? ""),
    createdAt: api.createdAt ?? api.orderDate ?? null,
    status: String(api.status ?? api.orderStatus ?? "").toLowerCase(),
    paymentMethod: String(api.paymentMethod ?? "").toLowerCase() === "cod" ? "cod" : "online",
    items: pickList(api, ["items", "orderItems", "lines"]).map(mapCartItem),
    summary: mapTotals(api.summary ?? api.totals ?? api),
    address: api.shippingAddress ?? api.address ?? null,
  };
}

export const mapOrderList = (data) => pickList(data, ["items", "data", "orders"]).map(mapOrder);

/** Result of placing an order. `payment` is null for COD. */
export function mapPlaceOrderResult(api) {
  const payment = api?.payment ?? null;

  return {
    order: mapOrder(api?.order ?? api),
    payment: payment
      ? {
          provider: payment.provider ?? "razorpay",
          gatewayOrderId: payment.gatewayOrderId ?? payment.razorpayOrderId ?? payment.orderId,
          amount: num(payment.amount),
          currency: payment.currency ?? "INR",
          key: payment.key ?? payment.keyId ?? null, // public key only, never a secret
        }
      : null,
  };
}

/** @returns {CheckoutSummary} */
export function mapCheckoutSummary(api) {
  return {
    items: pickList(api, ["items", "cartItems", "lines"]).map(mapCartItem),
    summary: mapTotals(api?.summary ?? api?.totals ?? api),
    codAvailable: Boolean(api?.codAvailable ?? api?.isCodAvailable ?? false),
    messages: Array.isArray(api?.messages) ? api.messages : [],
  };
}

export function mapPincodeCheck(api, pincode) {
  return {
    pincode: String(api?.pincode ?? pincode),
    serviceable: Boolean(api?.serviceable ?? api?.isServiceable ?? api?.deliverable ?? false),
    codAvailable: Boolean(api?.codAvailable ?? api?.isCodAvailable ?? false),
    estimatedDelivery: api?.estimatedDelivery ?? api?.deliveryDate ?? null,
    shipping: num(api?.shipping ?? api?.shippingCharge, 0),
  };
}
