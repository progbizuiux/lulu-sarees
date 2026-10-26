import { mapAddress, mapAddressInput } from "./address.mapper";
import { mapCartItem, mapTotals } from "./cart.mapper";
import { compact, num, pickList, toArray } from "./utils";

/**
 * @typedef {Object} OrderEvent      one step in the order's history
 * @property {string} status
 * @property {string} [label]        text from the backend, if any
 * @property {string|null} date      ISO date
 * @property {string} [note]
 */

/**
 * @typedef {Object} Order
 * @property {string|number} id
 * @property {string} number        order number shown to the customer
 * @property {string} createdAt     ISO date
 * @property {string} status        e.g. "pending_payment", "confirmed", "shipped"
 * @property {"cod"|"online"} paymentMethod
 * @property {import("./cart.mapper").CartItem[]} items
 * @property {number} itemCount
 * @property {import("./cart.mapper").Totals} summary
 * @property {import("./address.mapper").Address|null} address
 * @property {OrderEvent[]} timeline   newest first
 * @property {{courier: string, trackingNumber: string, trackingUrl: string, estimatedDelivery: string|null}|null} tracking
 */

const normalizeStatus = (value) => String(value ?? "").toLowerCase().replace(/[\s-]+/g, "_");

function mapTimeline(api) {
  const events = toArray(api.timeline ?? api.statusHistory ?? api.history).map((event) => ({
    status: normalizeStatus(event.status ?? event.code),
    label: event.label ?? event.title ?? undefined,
    date: event.date ?? event.createdAt ?? event.timestamp ?? null,
    note: event.note ?? event.description ?? undefined,
  }));
  return events.sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));
}

function mapTracking(api) {
  const source = api.tracking ?? api.shipment ?? null;
  const trackingNumber = source?.trackingNumber ?? source?.awb ?? api.trackingNumber;
  if (!source && !trackingNumber) return null;
  return {
    courier: source?.courier ?? source?.carrier ?? api.courier ?? "",
    trackingNumber: trackingNumber ?? "",
    trackingUrl: source?.trackingUrl ?? source?.url ?? "",
    estimatedDelivery: source?.estimatedDelivery ?? api.estimatedDelivery ?? null,
  };
}

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

  const items = pickList(api, ["items", "orderItems", "lines"]).map(mapCartItem);

  return {
    id: api.id ?? api.orderId,
    number: String(api.orderNumber ?? api.number ?? api.id ?? ""),
    createdAt: api.createdAt ?? api.orderDate ?? null,
    status: normalizeStatus(api.status ?? api.orderStatus),
    paymentMethod: String(api.paymentMethod ?? "").toLowerCase() === "cod" ? "cod" : "online",
    items,
    itemCount: num(api.itemCount, items.reduce((count, item) => count + item.quantity, 0)),
    summary: mapTotals(api.summary ?? api.totals ?? api),
    address: mapAddress(api.shippingAddress ?? api.address),
    timeline: mapTimeline(api),
    tracking: mapTracking(api),
  };
}

export const mapOrderList = (data) => pickList(data, ["items", "data", "orders"]).map(mapOrder);

/**
 * Checkout form -> "place order" request body. The cart (items, coupon) is already on the backend,
 * so only the delivery and payment choices are sent.
 * Logged-in customers send a saved `addressId`; guests send the full address and their email.
 */
export function mapPlaceOrderInput({ paymentMethod, addressId, address, email, note }) {
  return compact({
    paymentMethod, // "cod" | "online"
    addressId,
    shippingAddress: address ? mapAddressInput(address) : undefined,
    email,
    note,
  });
}

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
