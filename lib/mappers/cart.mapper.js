// Converts backend cart data into the shape the UI uses.
// All totals come from the backend; the frontend only displays them.
import { PLACEHOLDER_IMAGE, num, pickList } from "./utils";

/**
 * @typedef {Object} Totals
 * @property {number} subtotal
 * @property {number} discount
 * @property {number} shipping
 * @property {number} codFee
 * @property {number} tax
 * @property {number} total
 */

/**
 * @typedef {Object} CartItem
 * @property {string|number} id         cart line id (used to update/remove)
 * @property {string|number} productId
 * @property {string|number|null} variantId
 * @property {string} title
 * @property {string} [variantName]
 * @property {string} imgSrc
 * @property {number} price
 * @property {number} [oldPrice]
 * @property {number} quantity
 * @property {number} lineTotal
 * @property {number|null} maxQuantity
 * @property {boolean} inStock
 */

/**
 * @typedef {Object} Cart
 * @property {CartItem[]} items
 * @property {number} itemCount
 * @property {{code: string}|null} coupon
 * @property {Totals} summary
 * @property {{threshold: number, remaining: number}|null} freeShipping  null if the backend doesn't send it
 */

/**
 * @typedef {Object} Coupon
 * @property {string} code
 * @property {string} title        e.g. "10% OFF"
 * @property {string} description  e.g. "On all orders"
 */

/** @returns {Totals} */
export function mapTotals(api = {}) {
  return {
    subtotal: num(api?.subtotal ?? api?.subTotal),
    discount: num(api?.discount ?? api?.discountAmount),
    shipping: num(api?.shipping ?? api?.shippingCharge ?? api?.shippingFee),
    codFee: num(api?.codFee ?? api?.codCharge),
    tax: num(api?.tax ?? api?.taxAmount ?? api?.gst),
    total: num(api?.total ?? api?.grandTotal),
  };
}

/**
 * ERP cart line { cartID, productID, variantID, productName, variantName, imageUrl, price, quantity,
 * lineTotal, inStock, problem } (order lines use the same names, with `name`).
 * @returns {CartItem}
 */
export function mapCartItem(api) {
  const price = num(api?.price ?? api?.unitPrice);
  const quantity = num(api?.quantity, 1);
  const oldPrice = num(api?.oldPrice ?? api?.mrp, 0);
  const title = api?.title ?? api?.productName ?? api?.name ?? api?.product?.name ?? "";
  const variantName = api?.variantName ?? undefined;

  return {
    id: api?.cartID ?? api?.id ?? api?.cartItemId ?? api?.variantID,
    productId: api?.productID ?? api?.productId ?? api?.product?.id,
    variantId: api?.variantID ?? api?.variantId ?? null,
    title,
    // The ERP repeats the product name as the variant name when there's only one variant.
    variantName: variantName && variantName !== title ? variantName : undefined,
    imgSrc: api?.imageUrl ?? api?.image ?? api?.imgSrc ?? api?.product?.imageUrl ?? PLACEHOLDER_IMAGE,
    price,
    oldPrice: oldPrice > price ? oldPrice : undefined,
    quantity,
    // Only falls back to price x quantity if the backend leaves the line total out.
    lineTotal: num(api?.lineTotal ?? api?.total, price * quantity),
    maxQuantity: api?.maxQuantity ?? api?.stock ?? null,
    inStock: api?.inStock ?? true,
    // e.g. "Sold out", "Only 2 left": this line can't be ordered until the customer fixes it.
    problem: api?.problem ?? null,
  };
}

export const EMPTY_CART = Object.freeze({
  items: [],
  itemCount: 0,
  coupon: null,
  summary: mapTotals({}),
  freeShipping: null,
  canCheckout: false,
});

/** "Add ₹X more for free shipping". Only shown when the backend sends a threshold. */
function mapFreeShipping(api) {
  const source = api?.freeShipping ?? api;
  const threshold = source?.threshold ?? source?.freeShippingThreshold;
  if (threshold === undefined || threshold === null) return null;
  return {
    threshold: num(threshold),
    remaining: Math.max(0, num(source?.remaining ?? source?.freeShippingRemaining)),
  };
}

export const mapCoupons = (data) =>
  pickList(data, ["items", "data", "coupons"]).map((coupon) => ({
    code: String(coupon.code ?? ""),
    title: coupon.title ?? coupon.name ?? coupon.code ?? "",
    description: coupon.description ?? "",
  }));

/** @returns {Cart} */
export function mapCart(api) {
  if (!api) return EMPTY_CART;

  const items = pickList(api, ["items", "cartItems", "lines"]).map(mapCartItem);
  const couponCode = api.couponCode ?? api.coupon?.code;

  const summary = mapTotals(api.summary ?? api.totals ?? api);
  return {
    items,
    itemCount: num(api.itemCount, items.reduce((count, item) => count + item.quantity, 0)),
    coupon: couponCode ? { code: couponCode } : null,
    // The ERP cart only has a subtotal; delivery and tax are added at checkout.
    summary: { ...summary, total: summary.total || summary.subtotal },
    freeShipping: mapFreeShipping(api),
    canCheckout: api.canCheckout ?? true,
  };
}
