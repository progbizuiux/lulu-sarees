// Fake checkout and orders API.
// Pincode 999999 is "not serviceable", and COD is refused above the COD limit, so those cases can be tested.
// Orders remember who placed them (email/phone), so "My orders" and order tracking can find them.
import { MOCK_RULES, buildCart, clearCart } from "./cart";
import { delay, mockError, readStore, requireUser, writeStore } from "./utils";
import { mapOrder } from "@/lib/mappers/order.mapper";
import { normalizeIndianMobile } from "@/lib/validation";

const STORE_KEY = "orders";
const readOrders = () => readStore(STORE_KEY, []);
const saveOrders = (orders) => writeStore(STORE_KEY, orders);
const event = (status) => ({ status, date: new Date().toISOString() });
const sameText = (a, b) => String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

export async function getCheckoutSummary({ paymentMethod } = {}) {
  await delay();
  const cart = buildCart(undefined, { paymentMethod });
  const codAvailable = cart.summary.total <= MOCK_RULES.codMaxTotal;
  const messages = [];
  if (cart.summary.discount > 0) messages.push(`You saved ₹${cart.summary.discount}!`);
  if (!codAvailable) messages.push(`Cash on Delivery is available for orders up to ₹${MOCK_RULES.codMaxTotal}.`);
  return { items: cart.items, summary: cart.summary, codAvailable, messages };
}

export async function checkPincode(pincode) {
  await delay();
  if (!/^[1-9]\d{5}$/.test(String(pincode || ""))) {
    throw mockError(400, "Enter a valid 6-digit pincode.", { pincode: "Enter a valid 6-digit pincode." });
  }
  const serviceable = String(pincode) !== "999999";
  const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
  return {
    pincode: String(pincode),
    serviceable,
    codAvailable: serviceable,
    estimatedDelivery: serviceable ? deliveryDate.toISOString() : null,
    shipping: 0,
  };
}

export async function placeOrder({ paymentMethod = "online", addressId, address: guestAddress, email = "", note } = {}) {
  await delay();
  const cart = buildCart(undefined, { paymentMethod });
  if (!cart.items.length) throw mockError(400, "Your cart is empty.");

  const user = readStore("user", null);
  if (!user && !email) throw mockError(400, "Enter your email address.", { email: "Enter your email address." });

  // Logged-in customers send a saved address id; guests send the address itself.
  const address = addressId
    ? readStore("addresses", []).find((saved) => String(saved.id) === String(addressId))
    : guestAddress;
  if (!address) throw mockError(400, "Choose a delivery address.");
  if (String(address.pincode) === "999999") {
    throw mockError(400, `Sorry, we don't deliver to pincode ${address.pincode} yet.`);
  }
  if (paymentMethod === "cod" && cart.summary.total > MOCK_RULES.codMaxTotal) {
    throw mockError(400, "Cash on Delivery isn't available for this order.");
  }

  const orders = readOrders();
  const id = Date.now();
  const status = paymentMethod === "cod" ? "confirmed" : "pending_payment";
  const order = {
    id,
    number: `LS${String(id).slice(-8)}`,
    createdAt: new Date().toISOString(),
    status,
    paymentMethod: paymentMethod === "cod" ? "cod" : "online",
    items: cart.items,
    summary: cart.summary,
    address,
    note: note ?? "",
    contact: { email: user?.email ?? email, phone: address?.phone ?? "" },
    timeline: status === "confirmed" ? [event("confirmed"), event("placed")] : [event("placed")],
    tracking: null,
  };
  saveOrders([order, ...orders]);

  if (paymentMethod === "cod") {
    clearCart();
    return { order: mapOrder(order), payment: null };
  }

  return {
    order: mapOrder(order),
    payment: {
      provider: "razorpay",
      gatewayOrderId: `mock_order_${id}`,
      amount: cart.summary.total,
      currency: "INR",
      key: null,
    },
  };
}

export async function verifyPayment({ orderId }) {
  await delay();
  const orders = readOrders();
  const order = orders.find((item) => String(item.id) === String(orderId));
  if (!order) throw mockError(404, "Order not found.");
  order.status = "confirmed";
  order.timeline = [event("confirmed"), ...(order.timeline ?? [])];
  saveOrders(orders);
  clearCart();
  return mapOrder(order);
}

// "My orders": only the logged-in customer's orders, newest first.
const ownOrders = (user) =>
  readOrders()
    .filter((order) => sameText(order.contact?.email, user.email))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export async function listOrders() {
  await delay();
  const user = requireUser();
  return ownOrders(user).map(mapOrder);
}

export async function getOrder(orderId) {
  await delay();
  const user = requireUser();
  const order = ownOrders(user).find((item) => String(item.id) === String(orderId));
  if (!order) throw mockError(404, "We couldn't find this order.");
  return mapOrder(order);
}

/**
 * Order tracking for anyone (no login): needs the order number AND the email or phone used.
 * The same error for "wrong number" and "wrong contact", so it can't be used to guess orders.
 */
export async function trackOrder({ orderNumber, contact }) {
  await delay();
  const order = readOrders().find((item) => sameText(item.number, orderNumber));
  const phone = normalizeIndianMobile(contact);
  const matches =
    order &&
    (sameText(order.contact?.email, contact) ||
      (phone && phone === normalizeIndianMobile(order.contact?.phone ?? order.address?.phone)));
  if (!matches) throw mockError(404, "We couldn't find an order with these details. Please check and try again.");
  return mapOrder(order);
}
