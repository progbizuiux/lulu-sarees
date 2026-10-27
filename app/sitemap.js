// /sitemap.xml: tells search engines which pages exist. Rebuilt at most once an hour.
import { luluMenu, accountLinks } from "@/data/luluMenu";
import { productService } from "@/services/product.service";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const STATIC_PAGES = ["/", "/about-us", "/contact", "/FAQs", "/term-of-use", "/order-tracking"];
const PRIVATE_PREFIXES = ["/my-account", "/checkout", "/shopping-cart", "/order-success", "/login", "/register", "/wish-list", "/search-result", "/forget-password"];
const MAX_PRODUCT_PAGES = 50; // safety limit: 50 pages × 100 products

// Every link in the menu (categories, collections, blog pages), found wherever `href` appears.
function menuLinks(node) {
  if (Array.isArray(node)) return node.flatMap(menuLinks);
  if (!node || typeof node !== "object") return [];
  return [...(typeof node.href === "string" ? [node.href] : []), ...Object.values(node).flatMap(menuLinks)];
}

async function allProducts() {
  const products = [];
  try {
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
      const result = await productService.list({ page, pageSize: 100 });
      products.push(...result.items);
      if (page >= result.totalPages) break;
    }
  } catch {
    // If the product API is down, still publish the other pages.
  }
  return products;
}

export default async function sitemap() {
  const now = new Date();
  const isPublic = (path) => path.startsWith("/") && !PRIVATE_PREFIXES.some((prefix) => path.startsWith(prefix));
  const paths = [...new Set([...STATIC_PAGES, ...menuLinks(luluMenu), ...menuLinks(accountLinks)])].filter(isPublic);

  const pages = paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const products = (await allProducts()).map((product) => ({
    url: `${SITE_URL}/product-detail/${encodeURIComponent(product.id)}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...pages, ...products];
}
