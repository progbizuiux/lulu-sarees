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

/** @returns {CartItem} */
export function mapCartItem(api) {
  const price = num(api?.price ?? api?.unitPrice);
  const quantity = num(api?.quantity, 1);
  const oldPrice = num(api?.oldPrice ?? api?.mrp, 0);

  return {
    id: api?.id ?? api?.cartItemId,
    productId: api?.productId ?? api?.product?.id,
    variantId: api?.variantId ?? null,
    title: api?.title ?? api?.productName ?? api?.name ?? api?.product?.name ?? "",
    variantName: api?.variantName ?? undefined,
    imgSrc: api?.imageUrl ?? api?.image ?? api?.product?.imageUrl ?? PLACEHOLDER_IMAGE,
    price,
    oldPrice: oldPrice > price ? oldPrice : undefined,
    quantity,
    // Only falls back to price x quantity if the backend leaves the line total out.
    lineTotal: num(api?.lineTotal ?? api?.total, price * quantity),
    maxQuantity: api?.maxQuantity ?? api?.stock ?? null,
    inStock: api?.inStock ?? true,
  };
}

export const EMPTY_CART = Object.freeze({
  items: [],
  itemCount: 0,
  coupon: null,
  summary: mapTotals({}),
});

/** @returns {Cart} */
export function mapCart(api) {
  if (!api) return EMPTY_CART;

  const items = pickList(api, ["items", "cartItems", "lines"]).map(mapCartItem);
  const couponCode = api.couponCode ?? api.coupon?.code;

  return {
    items,
    itemCount: num(api.itemCount, items.reduce((count, item) => count + item.quantity, 0)),
    coupon: couponCode ? { code: couponCode } : null,
    summary: mapTotals(api.summary ?? api.totals ?? api),
  };
}
