// Fake cart API. It calculates totals the way the real backend will,
// so the UI can be built and tested against realistic responses.
import { findProduct } from "./products";
import { delay, mockError, readStore, roundMoney, writeStore } from "./utils";

// Demo business rules. The real values will come from the backend.
export const MOCK_RULES = {
  freeShippingAbove: 999,
  shippingFee: 79,
  codFee: 40,
  codMaxTotal: 10000,
  maxQuantityPerItem: 10,
};

const COUPONS = {
  LULU10: { type: "percent", value: 10, minSubtotal: 0, title: "10% OFF", description: "On all orders" },
  WELCOME200: {
    type: "flat",
    value: 200,
    minSubtotal: 1999,
    title: "₹200 OFF",
    description: "On orders of ₹1999 or more",
  },
};

const STORE_KEY = "cart";
const lineId = (productId, variantId) => `${productId}:${variantId ?? "default"}`;
const readCart = () => readStore(STORE_KEY, { lines: [], couponCode: null });
const saveCart = (cart) => writeStore(STORE_KEY, cart);

function couponDiscount(code, subtotal) {
  const coupon = code && COUPONS[code];
  if (!coupon || subtotal < coupon.minSubtotal) return 0;
  const amount = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  return roundMoney(Math.min(amount, subtotal));
}

/** Builds the full cart response from what's stored. Shared with the orders mock. */
export function buildCart(stored = readCart(), { paymentMethod } = {}) {
  const items = stored.lines
    .map((line) => {
      const product = findProduct(line.productId);
      if (!product) return null;
      return {
        id: line.id,
        productId: product.id,
        variantId: line.variantId ?? null,
        title: product.title,
        imgSrc: product.imgSrc,
        price: product.price,
        oldPrice: product.oldPrice,
        quantity: line.quantity,
        lineTotal: roundMoney(product.price * line.quantity),
        maxQuantity: MOCK_RULES.maxQuantityPerItem,
        inStock: product.inStock,
      };
    })
    .filter(Boolean);

  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const discount = couponDiscount(stored.couponCode, subtotal);
  const afterDiscount = subtotal - discount;
  const shipping = items.length === 0 || afterDiscount >= MOCK_RULES.freeShippingAbove ? 0 : MOCK_RULES.shippingFee;
  const codFee = paymentMethod === "cod" && items.length > 0 ? MOCK_RULES.codFee : 0;

  return {
    items,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    coupon: stored.couponCode ? { code: stored.couponCode } : null,
    // Prices are GST-inclusive, so tax isn't added on top.
    summary: { subtotal, discount, shipping, codFee, tax: 0, total: roundMoney(afterDiscount + shipping + codFee) },
    freeShipping: {
      threshold: MOCK_RULES.freeShippingAbove,
      remaining: roundMoney(Math.max(0, MOCK_RULES.freeShippingAbove - afterDiscount)),
    },
  };
}

export async function getAvailableCoupons() {
  await delay();
  return Object.entries(COUPONS).map(([code, coupon]) => ({
    code,
    title: coupon.title,
    description: coupon.description,
  }));
}

export async function getCart() {
  await delay();
  return buildCart();
}

export async function addItem({ productId, variantId = null, quantity = 1 }) {
  await delay();
  const product = findProduct(productId);
  if (!product) throw mockError(404, "This product could not be found.");
  if (!product.inStock) throw mockError(409, "Sorry, this item is out of stock.");

  const cart = readCart();
  const id = lineId(product.id, variantId);
  const existing = cart.lines.find((line) => line.id === id);
  const newQuantity = (existing?.quantity ?? 0) + Number(quantity || 1);

  if (newQuantity > MOCK_RULES.maxQuantityPerItem) {
    throw mockError(400, `You can add up to ${MOCK_RULES.maxQuantityPerItem} of this item.`);
  }

  if (existing) existing.quantity = newQuantity;
  else cart.lines.push({ id, productId: product.id, variantId, quantity: newQuantity });

  saveCart(cart);
  return buildCart(cart);
}

export async function updateItem(itemId, quantity) {
  await delay();
  const cart = readCart();
  const line = cart.lines.find((item) => item.id === itemId);
  if (!line) throw mockError(404, "This item is no longer in your cart.");
  if (quantity > MOCK_RULES.maxQuantityPerItem) {
    throw mockError(400, `You can add up to ${MOCK_RULES.maxQuantityPerItem} of this item.`);
  }

  if (quantity < 1) cart.lines = cart.lines.filter((item) => item.id !== itemId);
  else line.quantity = quantity;

  saveCart(cart);
  return buildCart(cart);
}

export async function removeItem(itemId) {
  await delay();
  const cart = readCart();
  cart.lines = cart.lines.filter((item) => item.id !== itemId);
  saveCart(cart);
  return buildCart(cart);
}

export async function applyCoupon(code) {
  await delay();
  const normalized = String(code || "").trim().toUpperCase();
  const coupon = COUPONS[normalized];
  if (!coupon) throw mockError(400, "This coupon code is not valid.", { code: "This coupon code is not valid." });

  const cart = readCart();
  const { summary } = buildCart(cart);
  if (summary.subtotal < coupon.minSubtotal) {
    const message = `Add items worth ₹${coupon.minSubtotal} or more to use this coupon.`;
    throw mockError(400, message, { code: message });
  }

  cart.couponCode = normalized;
  saveCart(cart);
  return buildCart(cart);
}

export async function removeCoupon() {
  await delay();
  const cart = readCart();
  cart.couponCode = null;
  saveCart(cart);
  return buildCart(cart);
}

export function clearCart() {
  saveCart({ lines: [], couponCode: null });
}

/** "Clear cart" button: removes every item (and the coupon) and returns the empty cart. */
export async function emptyCart() {
  await delay();
  clearCart();
  return buildCart();
}
