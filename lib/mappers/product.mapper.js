// Converts ERP product data into the shape the template's components already use.
// ERP fields (handover): product card { productID, slug, name, variantID, variantName, price, minPrice,
// maxPrice, variantCount, imageUrl, inStock, isFeatured, isNewArrival, isBestSelling, hasVideo, ... }
// and product details { ..., images[{url}], variants[{variantID, name, price, inStock, isDefault}],
// description, rating, videoUrl, related[] }.
import { PLACEHOLDER_IMAGE, compact, num, pickList, toArray } from "./utils";

/**
 * @typedef {Object} Product
 * @property {number|string} id          the ERP productID (used in /product-detail/{id})
 * @property {string} [slug]
 * @property {string} title
 * @property {number} price              price the customer pays (includes tax)
 * @property {number} [oldPrice]         original price, shown struck through
 * @property {boolean} isOnSale
 * @property {string} [salePercentage]   e.g. "25%"
 * @property {string} imgSrc
 * @property {string} [imgHover]
 * @property {string[]} images
 * @property {boolean} inStock
 * @property {string} [description]
 * @property {number|string|null} variantId   the variant "Add to cart" on a card adds
 * @property {Array<{id: string|number, name: string, price: number, inStock: boolean, isDefault?: boolean}>} variants
 * @property {Array<{id: number, src: string, alt: string, width: number, height: number, color: string}>} [gallery]
 * @property {string|null} [videoUrl]
 * @property {Product[]} [related]
 */

/**
 * Filter options with counts, so the filter panel only offers choices that exist.
 * @typedef {Object} Facets
 * @property {Array<{slug: string, name: string, count: number}>} categories
 * @property {Array<{name: string, hex?: string, count: number}>} colors
 * @property {Array<{name: string, count: number}>} sizes
 * @property {Array<{id?: number, name: string, count: number}>} brands
 * @property {{inStock: number, outOfStock: number}|null} availability
 * @property {{min: number, max: number}|null} priceRange
 */

/**
 * @typedef {Object} ProductList
 * @property {Product[]} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 * @property {number} totalPages
 * @property {Facets|null} facets
 */

const imageUrl = (image) => (typeof image === "string" ? image : image?.url ?? image?.imageUrl);

function mapVariant(variant, fallbackPrice) {
  return {
    id: variant.variantID ?? variant.id ?? variant.variantId,
    name: variant.name ?? [variant.color, variant.size].filter(Boolean).join(" / "),
    price: num(variant.price, fallbackPrice),
    inStock: variant.inStock ?? num(variant.stock, 1) > 0,
    isDefault: Boolean(variant.isDefault),
  };
}

/** @returns {Product|null} */
export function mapProduct(api) {
  if (!api) return null;

  const title = api.name ?? api.productName ?? api.title ?? "";
  const images = [...new Set(toArray(api.images).map(imageUrl).filter(Boolean))];
  const price = num(api.salePrice ?? api.price);
  const listedOldPrice = num(api.salePrice != null ? api.price : api.oldPrice ?? api.mrp, 0);
  const oldPrice = listedOldPrice > price ? listedOldPrice : undefined;
  const stock = api.stock ?? api.stockQuantity;
  const variants = toArray(api.variants).map((variant) => mapVariant(variant, price));
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants.find((v) => v.inStock) ?? variants[0];
  const mainImage = images[0] ?? api.imageUrl ?? api.thumbnailUrl;

  return {
    id: api.productID ?? api.id ?? api.productId,
    slug: api.slug ?? undefined,
    title,
    price,
    oldPrice,
    isOnSale: Boolean(oldPrice),
    salePercentage: oldPrice ? `${Math.round((1 - price / oldPrice) * 100)}%` : undefined,
    imgSrc: mainImage ?? PLACEHOLDER_IMAGE,
    imgHover: images[1],
    images: images.length ? images : mainImage ? [mainImage] : [],
    inStock: api.inStock ?? (stock === undefined || stock === null ? true : num(stock) > 0),
    description: api.description ?? api.shortDescription ?? undefined,
    variantId: api.variantID ?? defaultVariant?.id ?? null,
    gallery: images.length
      ? images.map((src, index) => ({
          id: index + 1,
          src,
          alt: title,
          width: 600,
          height: 800,
          color: "gray", // the template's slider groups photos by colour
        }))
      : undefined,
    variants,
    videoUrl: api.videoUrl ?? null,
    related: toArray(api.related).map(mapProduct),
  };
}

/** ERP { items, total, page, pageSize } (+ filter view) -> ProductList */
export function mapProductList(data, params = {}, filterView = null) {
  const items = pickList(data, ["items", "data", "products", "results"]).map(mapProduct);
  const pageSize = num(data?.pageSize, params.pageSize ?? items.length);
  const total = num(data?.totalCount ?? data?.total, items.length);

  return {
    items,
    page: num(data?.page ?? data?.pageNumber, params.page ?? 1),
    pageSize,
    total,
    totalPages: num(data?.totalPages, pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1),
    facets: mapFacets(filterView ?? data?.facets ?? data?.filters),
  };
}

const facetList = (list) =>
  toArray(list)
    .map((entry) => (typeof entry === "string" ? { name: entry, count: 0 } : entry))
    .filter((entry) => entry?.name ?? entry?.label ?? entry?.value)
    .map((entry) => ({
      ...entry,
      name: String(entry.name ?? entry.label ?? entry.value),
      count: num(entry.count),
    }));

/** ERP get-filter-view { minPrice, maxPrice, brands[{id,name,count}], categories[{id,name,slug,count}] } -> Facets */
export function mapFacets(api) {
  if (!api) return null;
  const price =
    api.priceRange ?? api.price ?? (api.minPrice != null || api.maxPrice != null ? { min: api.minPrice, max: api.maxPrice } : null);
  const availability = api.availability;
  return {
    // The ERP can send a null slug; the id then works as the category filter value.
    categories: facetList(api.categories).map((category) => ({
      ...category,
      slug: String(category.slug ?? category.id ?? category.name),
    })),
    colors: facetList(api.colors),
    sizes: facetList(api.sizes),
    brands: facetList(api.brands),
    availability: availability
      ? { inStock: num(availability.inStock), outOfStock: num(availability.outOfStock) }
      : null,
    priceRange: price ? { min: num(price.min), max: num(price.max) } : null,
  };
}

// Our sort names -> the ERP's (newest, price-asc, price-desc, name, rating, featured).
// The ERP sorts names A-Z only, so both title sorts use "name".
const SORTS = {
  "price-asc": "price-asc",
  "price-desc": "price-desc",
  "title-asc": "name",
  "title-desc": "name",
};

/**
 * Our filters -> the get-product-list / get-filter-view request body.
 * Colour, size, "on sale" and "out of stock only" have no ERP filter yet, so they're not sent.
 */
export function mapProductQuery(params = {}) {
  const category = params.category ? String(params.category) : undefined;
  const brandIds = toArray(params.brands).map(Number).filter(Number.isFinite);
  return compact({
    categoryID: category && /^\d+$/.test(category) ? Number(category) : undefined,
    categorySlug: category && !/^\d+$/.test(category) ? category : undefined,
    brandIDs: brandIds.length ? brandIds : undefined,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    search: params.search,
    inStockOnly: params.inStock === true ? true : undefined,
    sort: SORTS[params.sort] ?? undefined, // ERP default: newest
    page: params.page,
    pageSize: params.pageSize ? Math.min(params.pageSize, 60) : undefined, // ERP max 60
  });
}

/**
 * ERP get-wishlist-items [{ wishlistID, productID, variantID, productName, imageUrl, price, inStock }]
 * -> { productIds, items }. Each item keeps its wishlistID (needed to remove it).
 */
export function mapWishlist(data) {
  const items = pickList(data, ["items", "data", "products"]).map((entry) => ({
    ...mapProduct(entry?.product ?? entry),
    wishlistId: entry?.wishlistID ?? entry?.wishlistId ?? null,
  }));
  return { productIds: items.map((item) => item.id), items };
}
