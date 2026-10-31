import { mapAddress } from "./address.mapper";
import { mapCartItem, mapTotals } from "./cart.mapper";
import { num, pickList, toArray } from "./utils";

/**
 * @typedef {Object} OrderEvent      one step in the order's history
 * @property {string} status
 * @property {string} [label]        text from the backend, if any
 * @property {string|null} date      ISO date
 * @property {string} [note]
 */

/**
 * @typedef {Object} Order
 * @property {string|number} id        ERP orderID (a long random id); every order call uses it
 * @property {string} number           order number shown to the customer (ERP orderNo, e.g. WS-123)
 * @property {string} createdAt        ISO date
 * @property {string} status           e.g. "pending_payment", "confirmed", "shipped"
 * @property {string} [paymentStatus]  paid, pending, failed, cod, cancelled
 * @property {"cod"|"online"} paymentMethod
 * @property {import("./cart.mapper").CartItem[]} items
 * @property {number} itemCount
 * @property {string} [firstItemName]  orders list: name of the first item
 * @property {string} [imageUrl]       orders list: photo of the first item
 * @property {import("./cart.mapper").Totals} summary
 * @property {import("./address.mapper").Address|null} address
 * @property {OrderEvent[]} timeline   newest first
 * @property {{courier: string, trackingNumber: string, trackingUrl: string, estimatedDelivery: string|null}|null} tracking
 * @property {boolean} canCancel
 * @property {boolean} canPay          an unpaid online order: "Pay now" (retry-payment)
 */

const normalizeStatus = (value) => String(value ?? "").toLowerCase().replace(/[\s-]+/g, "_");

function mapTimeline(api) {
  const events = toArray(api.timeline ?? api.statusHistory ?? api.history).map((event) => ({
    status: normalizeStatus(event.status ?? event.code),
    label: event.label ?? event.title ?? undefined,
    date: event.on ?? event.date ?? event.createdAt ?? event.timestamp ?? null,
    note: event.note ?? event.description ?? undefined,
  }));
  return events.sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));
}

function mapTracking(api) {
  const source = api.tracking ?? api.shipment ?? null;
  const trackingNumber = source?.trackingNumber ?? source?.awb ?? api.trackingNo ?? api.trackingNumber;
  const courier = source?.courier ?? source?.carrier ?? api.courierName ?? api.courier;
  const estimatedDelivery = source?.estimatedDelivery ?? api.expectedDeliveryDate ?? api.estimatedDelivery ?? null;
  if (!source && !trackingNumber && !courier && !estimatedDelivery) return null;
  return {
    courier: courier ?? "",
    trackingNumber: trackingNumber ?? "",
    trackingUrl: source?.trackingUrl ?? source?.url ?? "",
    estimatedDelivery,
  };
}

function paymentMethodOf(api) {
  if (api.isCashOnDelivery === true) return "cod";
  if (api.isCashOnDelivery === false) return "online";
  const method = String(api.paymentMethod ?? api.paymentStatus ?? "").toLowerCase();
  return method === "cod" ? "cod" : "online";
}

/**
 * ERP order (orders list item, order details or track-order) -> Order.
 * Details: { orderID, orderNo, date, orderStatus, paymentStatus, total, itemCount, invoiceNo, isCashOnDelivery,
 * lines[], subtotal, tax, charges, roundOff, deliveryAddress, timeline[{status, on}], courierName, trackingNo,
 * expectedDeliveryDate, canCancel, canPay }
 * @returns {Order|null}
 */
export function mapOrder(api) {
  if (!api) return null;

  const items = pickList(api, ["lines", "items", "orderItems"]).map(mapCartItem);
  const totals = mapTotals(api.summary ?? api.totals ?? api);
  // ERP "charges" = delivery + COD charges together.
  if (api.charges != null && !totals.shipping) totals.shipping = num(api.charges);

  return {
    id: api.orderID ?? api.id ?? api.orderId,
    number: String(api.orderNo ?? api.orderNumber ?? api.number ?? api.orderID ?? api.id ?? ""),
    createdAt: api.date ?? api.createdAt ?? api.orderDate ?? null,
    status: normalizeStatus(api.orderStatus ?? api.status),
    paymentStatus: api.paymentStatus ? normalizeStatus(api.paymentStatus) : undefined,
    paymentMethod: paymentMethodOf(api),
    items,
    itemCount: num(api.itemCount, items.reduce((count, item) => count + item.quantity, 0)),
    firstItemName: api.firstItemName ?? items[0]?.title,
    imageUrl: api.imageUrl ?? items[0]?.imgSrc,
    summary: totals,
    address: mapAddress(api.deliveryAddress ?? api.shippingAddress ?? api.address),
    timeline: mapTimeline(api),
    tracking: mapTracking(api),
    canCancel: Boolean(api.canCancel),
    canPay: Boolean(api.canPay),
  };
}

export const mapOrderList = (data) => pickList(data, ["items", "data", "orders"]).map(mapOrder);

/**
 * ERP get-checkout-summary { lines[], subtotal, tax, deliveryCharge, codCharge, roundOff, total,
 * canPayOnline, canPayCOD, codMessage, problems[] } -> what the checkout page shows.
 * The ERP lines have no photos, so the page shows the cart's lines next to these totals.
 */
export function mapCheckoutSummary(api) {
  const problems = toArray(api?.problems).map(String);
  return {
    items: [],
    summary: mapTotals({
      subtotal: api?.subtotal,
      discount: api?.discount,
      shipping: api?.deliveryCharge ?? api?.shipping,
      codFee: api?.codCharge ?? api?.codFee,
      tax: api?.tax,
      total: api?.total,
    }),
    onlineAvailable: Boolean(api?.canPayOnline),
    codAvailable: Boolean(api?.canPayCOD),
    codMessage: api?.codMessage ?? null,
    problems,
    messages: problems,
  };
}

/**
 * ERP create-order-from-cart { orderID, orderNo, total, isCashOnDelivery, paymentUrl, paymentError }.
 * Online: the shopper is sent to paymentUrl. If paymentError is set the order exists; offer "Pay now".
 */
export function mapPlaceOrderResult(api) {
  return {
    order: {
      ...mapOrder(api),
      summary: mapTotals({ total: api?.total }),
    },
    payment: api?.paymentUrl ? { provider: "redirect", url: api.paymentUrl } : null,
    paymentError: api?.paymentError ?? null,
    isCashOnDelivery: Boolean(api?.isCashOnDelivery),
  };
}

/** ERP get-order-payment-status / retry-payment { orderID, orderNo, paymentStatus, orderStatus, isConfirmed, total, paymentUrl } */
export function mapPaymentStatus(api) {
  return {
    orderId: api?.orderID ?? api?.orderId,
    orderNumber: String(api?.orderNo ?? ""),
    paymentStatus: normalizeStatus(api?.paymentStatus), // paid, pending, failed, cod, cancelled
    orderStatus: normalizeStatus(api?.orderStatus),
    isConfirmed: Boolean(api?.isConfirmed),
    total: num(api?.total),
    paymentUrl: api?.paymentUrl ?? null,
  };
}
