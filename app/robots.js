// /robots.txt: lets search engines crawl the shop, skips personal pages, and points to the sitemap.
// (Login, search and wishlist pages also carry a "noindex" tag in their metadata.)
import { SITE_URL } from "@/lib/site";

export default function robots() {
  // Only the live site should be indexed. On staging/preview set NEXT_PUBLIC_ALLOW_INDEXING=false.
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === "false") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/my-account", "/checkout", "/shopping-cart", "/order-success", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
