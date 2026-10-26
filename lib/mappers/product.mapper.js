// Converts backend product data into the shape the template's components already use.
// The backend field names on the right are guesses until the API docs arrive:
// when they do, fix the names here and every page keeps working.
import { PLACEHOLDER_IMAGE, compact, num, pickList, toArray } from "./utils";

/**
 * @typedef {Object} Product
 * @property {number|string} id
 * @property {string} [slug]
 * @property {string} title
 * @property {number} price          price the customer pays
 * @property {number} [oldPrice]     original price, shown struck through
 * @property {boolean} isOnSale
 * @property {string} [salePercentage] e.g. "25%"
 * @property {string} imgSrc
 * @property {string} [imgHover]
 * @property {string[]} images
 * @property {boolean} inStock
 * @property {string} [description]
 * @property {Array<{id: string|number, name: string, price: number, inStock: boolean}>} variants
 */

/**
 * @typedef {Object} ProductList
 * @property {Product[]} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 * @property {number} totalPages
 */

const imageUrl = (image) => (typeof image === "string" ? image : image?.url ?? image?.imageUrl);

/** @returns {Product|null} */
export function mapProduct(api) {
  if (!api) return null;

  const images = toArray(api.images).map(imageUrl).filter(Boolean);
  const price = num(api.salePrice ?? api.price);
  const listedOldPrice = num(api.salePrice != null ? api.price : api.oldPrice ?? api.mrp, 0);
  const oldPrice = listedOldPrice > price ? listedOldPrice : undefined;
  const stock = api.stock ?? api.stockQuantity;

  return {
    id: api.id ?? api.productId,
    slug: api.slug ?? undefined,
    title: api.title ?? api.name ?? "",
    price,
    oldPrice,
    isOnSale: Boolean(oldPrice),
    salePercentage: oldPrice ? `${Math.round((1 - price / oldPrice) * 100)}%` : undefined,
    imgSrc: images[0] ?? api.imageUrl ?? api.thumbnailUrl ?? PLACEHOLDER_IMAGE,
    imgHover: images[1],
    images,
    inStock: api.inStock ?? (stock === undefined || stock === null ? true : num(stock) > 0),
    description: api.description ?? undefined,
    variants: toArray(api.variants).map((variant) => ({
      id: variant.id ?? variant.variantId,
      name: variant.name ?? [variant.color, variant.size].filter(Boolean).join(" / "),
      price: num(variant.price, price),
      inStock: variant.inStock ?? num(variant.stock, 1) > 0,
    })),
  };
}

/** @returns {ProductList} */
export function mapProductList(data, params = {}) {
  const items = pickList(data, ["items", "data", "products", "results"]).map(mapProduct);
  const pageSize = num(data?.pageSize, params.pageSize ?? items.length);
  const total = num(data?.totalCount ?? data?.total, items.length);

  return {
    items,
    page: num(data?.page ?? data?.pageNumber, params.page ?? 1),
    pageSize,
    total,
    totalPages: num(data?.totalPages, pageSize ? Math.ceil(total / pageSize) : 1),
  };
}

/** Our filter names -> the backend's query param names. */
export function mapProductQuery(params = {}) {
  return compact({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    category: params.category,
    sortBy: params.sort,
    color: params.color,
    size: params.size,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    inStock: params.inStock,
  });
}

/** Wishlist response -> { productIds, items } */
export function mapWishlist(data) {
  const items = pickList(data, ["items", "data", "products"]).map((entry) => mapProduct(entry?.product ?? entry));
  return { productIds: items.map((item) => item.id), items };
}
