// Shop filters live in the URL (e.g. ?category=silk-sarees&color=Red&sort=price-asc&page=2),
// so a filtered page can be shared, bookmarked and reloaded, and the back button works.

export const DEFAULT_PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "", label: "Sort by (Default)" },
  { value: "title-asc", label: "Title Ascending" },
  { value: "title-desc", label: "Title Descending" },
  { value: "price-asc", label: "Price Ascending" },
  { value: "price-desc", label: "Price Descending" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "in-stock", label: "In stock", inStock: true },
  { value: "out-of-stock", label: "Out of stock", inStock: false },
];

/**
 * @typedef {Object} ShopFilters
 * @property {string} category   from the menu links
 * @property {string} search
 * @property {string} sort       one of SORT_OPTIONS values
 * @property {string} color
 * @property {string} size
 * @property {string} availability "in-stock" | "out-of-stock" | ""
 * @property {string[]} brands
 * @property {boolean} onSale
 * @property {number|undefined} minPrice
 * @property {number|undefined} maxPrice
 * @property {number} page
 */

/** @type {ShopFilters} */
export const EMPTY_FILTERS = Object.freeze({
  category: "",
  search: "",
  sort: "",
  color: "",
  size: "",
  availability: "",
  brands: [],
  onSale: false,
  minPrice: undefined,
  maxPrice: undefined,
  page: 1,
});

const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value));
const AVAILABILITY_VALUES = new Set(AVAILABILITY_OPTIONS.map((option) => option.value));

function readNumber(searchParams, key) {
  const raw = searchParams.get(key);
  if (raw === null || raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** URL -> filters. Unknown or broken values are ignored rather than breaking the page. */
export function readFilters(searchParams) {
  const text = (key) => (searchParams.get(key) ?? "").trim();
  const sort = text("sort");
  const availability = text("availability");

  return {
    category: text("category"),
    search: text("q"),
    sort: SORT_VALUES.has(sort) ? sort : "",
    color: text("color"),
    size: text("size"),
    availability: AVAILABILITY_VALUES.has(availability) ? availability : "",
    brands: text("brand").split(",").map((brand) => brand.trim()).filter(Boolean),
    onSale: text("sale") === "1",
    minPrice: readNumber(searchParams, "min"),
    maxPrice: readNumber(searchParams, "max"),
    page: Math.max(1, Math.floor(readNumber(searchParams, "page") ?? 1)),
  };
}

/** Filters -> URL query. Only non-default values are written, to keep links short. */
export function toQueryString(filters) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("q", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.color) params.set("color", filters.color);
  if (filters.size) params.set("size", filters.size);
  if (filters.availability) params.set("availability", filters.availability);
  if (filters.brands?.length) params.set("brand", filters.brands.join(","));
  if (filters.onSale) params.set("sale", "1");
  if (filters.minPrice !== undefined) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("max", String(filters.maxPrice));
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

/** Filters -> what productService.list() expects. */
export function toServiceParams(filters, pageSize = DEFAULT_PAGE_SIZE) {
  const availability = AVAILABILITY_OPTIONS.find((option) => option.value === filters.availability);
  return {
    page: filters.page,
    pageSize,
    category: filters.category || undefined,
    search: filters.search || undefined,
    sort: filters.sort || undefined,
    color: filters.color || undefined,
    size: filters.size || undefined,
    inStock: availability ? availability.inStock : undefined,
    brands: filters.brands.length ? filters.brands : undefined,
    onSale: filters.onSale || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };
}

/** True when the customer has narrowed the list (category and search don't count: they come from links). */
export const hasActiveFilters = (filters) =>
  Boolean(
    filters.color ||
      filters.size ||
      filters.availability ||
      filters.brands.length ||
      filters.onSale ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined
  );
