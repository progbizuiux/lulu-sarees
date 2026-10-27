// Server-side helpers for the shop pages: load the first screen of products and build page metadata.
import { luluMenu } from "@/data/luluMenu";
import { productService } from "@/services/product.service";
import { NO_INDEX } from "@/lib/site";
import { hasActiveFilters, readFilters, toServiceParams } from "./filters";

/** Next.js `searchParams` object -> URLSearchParams (so the same readFilters() works on server and browser). */
function toUrlSearchParams(searchParams = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }
  return params;
}

/**
 * Loads the products for this URL on the server, so the page's HTML already contains them
 * (search engines see real products, and phones don't wait for a second request).
 * Returns null if the API fails; the page then loads them in the browser and shows its own error.
 */
export async function loadShopList(searchParams) {
  const params = toServiceParams(readFilters(toUrlSearchParams(searchParams)));
  try {
    return { params, data: await productService.list(params) };
  } catch {
    return null;
  }
}

// "silk-sarees" -> the menu's label ("Silk Sarees"), or a readable version of the slug.
function categoryLabel(slug) {
  const find = (node) => {
    if (Array.isArray(node)) return node.map(find).find(Boolean);
    if (!node || typeof node !== "object") return null;
    if (typeof node.href === "string" && node.href.endsWith(`category=${slug}`)) return node.label;
    return Object.values(node).map(find).find(Boolean);
  };
  return find(luluMenu) ?? slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// Banner photo for each menu section (made by scripts/make-banners.cjs from the home page photos).
const SECTION_BANNERS = {
  Sarees: "sarees",
  Collections: "collections",
  Wedding: "wedding",
  Festive: "festive",
  "Ready to Wear": "ready-to-wear",
  Men: "men",
  Women: "women",
  Kids: "kids",
};
export const bannerUrl = (key) => `/images/banners/lulu-${key}.jpg`;

/**
 * Banner for a shop page: the banner of the menu section this category belongs to
 * (e.g. ?category=men-kurtas → Men), otherwise the page's own banner (`fallback`).
 */
export function shopBanner(searchParams, { path, fallback }) {
  const { category } = readFilters(toUrlSearchParams(searchParams));
  if (category) {
    const href = `${path}?category=${category}`;
    const section = luluMenu.find((item) => item.columns.some((col) => col.links.some((link) => link.href === href)));
    if (section && SECTION_BANNERS[section.label]) return bannerUrl(SECTION_BANNERS[section.label]);
  }
  return bannerUrl(fallback);
}

/** Heading for the page banner: the category's name when browsing a category, otherwise the fallback. */
export function shopHeading(searchParams, fallback) {
  const { category } = readFilters(toUrlSearchParams(searchParams));
  return category ? categoryLabel(category) : fallback;
}

/**
 * Title, description and canonical link for a shop page.
 * Filtered or sorted versions are "noindex": they repeat the same products and would clutter search results.
 */
export function shopMetadata(searchParams, { title, path }) {
  const filters = readFilters(toUrlSearchParams(searchParams));
  const label = filters.category ? categoryLabel(filters.category) : title;

  const canonical = new URLSearchParams();
  if (filters.category) canonical.set("category", filters.category);
  if (filters.page > 1) canonical.set("page", String(filters.page));
  const query = canonical.toString();

  return {
    title: filters.page > 1 ? `${label} (page ${filters.page})` : label,
    description: `Shop ${label.toLowerCase() === "shop" ? "sarees and ethnic wear" : label} online at Lulu Sarees.`,
    alternates: { canonical: query ? `${path}?${query}` : path },
    ...(hasActiveFilters(filters) || filters.sort || filters.search ? { robots: NO_INDEX } : {}),
  };
}
