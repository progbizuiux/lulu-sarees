// Fake product API built on the template's demo data.
import { allProducts, productMain } from "@/data/products";
import { PLACEHOLDER_IMAGE } from "@/lib/mappers/utils";
import { delay, mockError } from "./utils";

const uniqueById = (list) => [...new Map(list.map((product) => [String(product.id), product])).values()];

// The mock shop: the template's shop products plus the other women's-fashion and Lulu home-page
// demo products (about 45, enough to test pages of results). Other demo items (electronics, pets…)
// are left out so the mock shop still looks like a clothing store.
const isShopProduct = (product) =>
  product && typeof product.title === "string" && typeof product.price === "number" && typeof product.imgSrc === "string";
const FASHION_IMAGE_FOLDERS = ["/images/products/womens/", "/images/home/"];
const catalog = uniqueById([
  ...productMain,
  ...allProducts.filter(
    (product) => isShopProduct(product) && FASHION_IMAGE_FOLDERS.some((folder) => product.imgSrc.startsWith(folder))
  ),
]);
const everything = uniqueById(allProducts);

/** Demo product -> the same shape mapProduct returns for the real API. */
function toProduct(product) {
  const oldPrice = product.oldPrice > product.price ? product.oldPrice : undefined;
  return {
    ...product,
    slug: product.slug ?? String(product.id),
    imgSrc: product.imgSrc ?? PLACEHOLDER_IMAGE,
    oldPrice,
    isOnSale: Boolean(oldPrice),
    salePercentage: oldPrice ? `${Math.round((1 - product.price / oldPrice) * 100)}%` : undefined,
    images: [product.imgSrc, product.imgHover].filter(Boolean),
    inStock: product.inStock !== false,
    variants: [],
  };
}

export function findProduct(idOrSlug) {
  const key = String(idOrSlug);
  const product = everything.find((item) => String(item.id) === key || item.slug === key);
  return product ? toProduct(product) : null;
}

const SORTERS = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "title-asc": (a, b) => a.title.localeCompare(b.title),
  "title-desc": (a, b) => b.title.localeCompare(a.title),
};

// Counts each value across the catalog, e.g. colors: [{ name: "Red", count: 4 }, ...]
function countValues(listOf) {
  const counts = new Map();
  catalog.forEach((product) => listOf(product).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1)));
  return [...counts].map(([name, count]) => ({ name, count }));
}

// Filter options, worked out once from the demo data. The demo products have no categories,
// so the category filter is ignored in mock mode (every menu category shows all products).
const facets = {
  categories: [],
  colors: countValues((product) => product.filterColor ?? []),
  sizes: countValues((product) => product.filterSizes ?? []),
  brands: countValues((product) => product.filterBrands ?? []),
  availability: {
    inStock: catalog.filter((product) => product.inStock !== false).length,
    outOfStock: catalog.filter((product) => product.inStock === false).length,
  },
  priceRange: {
    min: Math.floor(Math.min(...catalog.map((product) => product.price))),
    max: Math.ceil(Math.max(...catalog.map((product) => product.price))),
  },
};

export async function listProducts(params = {}) {
  await delay();

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 12);
  const search = params.search?.trim().toLowerCase();

  let items = catalog.filter((product) => {
    if (search && !product.title.toLowerCase().includes(search)) return false;
    if (params.color && !product.filterColor?.includes(params.color)) return false;
    if (params.size && !product.filterSizes?.includes(params.size)) return false;
    if (params.inStock === true && product.inStock === false) return false;
    if (params.inStock === false && product.inStock !== false) return false;
    if (params.brands?.length && !params.brands.some((brand) => product.filterBrands?.includes(brand))) return false;
    if (params.onSale && !(product.oldPrice > product.price)) return false;
    if (params.minPrice != null && product.price < params.minPrice) return false;
    if (params.maxPrice != null && product.price > params.maxPrice) return false;
    return true;
  });

  if (SORTERS[params.sort]) items = [...items].sort(SORTERS[params.sort]);

  const total = items.length;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize).map(toProduct),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    facets,
  };
}

export async function getProduct(idOrSlug) {
  await delay();
  const product = findProduct(idOrSlug);
  if (!product) throw mockError(404, "This product could not be found.");
  return product;
}
