// Fake checkout and orders API.
// Pincode 999999 is "not serviceable", and COD is refused above the COD limit, so those cases can be tested.
import { MOCK_RULES, buildCart, clearCart } from "./cart";
import { delay, mockError, readStore, writeStore } from "./utils";

const STORE_KEY = "orders";
const readOrders = () => readStore(STORE_KEY, []);
const saveOrders = (orders) => writeStore(STORE_KEY, orders);

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

export async function placeOrder({ paymentMethod = "online", address = null } = {}) {
  await delay();
  const cart = buildCart(undefined, { paymentMethod });
  if (!cart.items.length) throw mockError(400, "Your cart is empty.");
  if (paymentMethod === "cod" && cart.summary.total > MOCK_RULES.codMaxTotal) {
    throw mockError(400, "Cash on Delivery isn't available for this order.");
  }

  const orders = readOrders();
  const id = Date.now();
  const order = {
    id,
    number: `LS${String(id).slice(-8)}`,
    createdAt: new Date().toISOString(),
    status: paymentMethod === "cod" ? "confirmed" : "pending_payment",
    paymentMethod: paymentMethod === "cod" ? "cod" : "online",
    items: cart.items,
    summary: cart.summary,
    address,
  };
  saveOrders([order, ...orders]);

  if (paymentMethod === "cod") {
    clearCart();
    return { order, payment: null };
  }

  return {
    order,
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
  saveOrders(orders);
  clearCart();
  return order;
}

export async function listOrders() {
  await delay();
  return readOrders();
}

export async function getOrder(orderId) {
  await delay();
  const order = readOrders().find((item) => String(item.id) === String(orderId));
  if (!order) throw mockError(404, "Order not found.");
  return order;
}
