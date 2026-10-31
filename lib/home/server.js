// Server-side loader for the home page product rows (ERP get-latest-products, get-best-selling-products,
// get-featured-products, get-products-with-video). Loaded on our server, so the HTML already has them.
import { config } from "@/lib/config";
import { productService } from "@/services/product.service";

const settle = (promise) => promise.catch(() => []); // one failing row must not break the home page

/**
 * @returns {Promise<null | {latest: Array, bestSelling: Array, featured: Array, videos: Array<{product: Object, src: string}>}>}
 *          null in mock mode: the sections then show their own demo products.
 */
export async function loadHomeRows() {
  if (config.useMocks) return null;

  const [latest, bestSelling, featured, withVideo] = await Promise.all([
    settle(productService.getRow("latest", 8)),
    settle(productService.getRow("bestSelling", 8)),
    settle(productService.getRow("featured", 4)),
    settle(productService.getRow("withVideo", 4)),
  ]);

  // Product cards don't carry the video link: it's in each product's details.
  const videos = (
    await Promise.all(
      withVideo.map((product) =>
        productService
          .get(product.id)
          .then((details) => (details.videoUrl ? { product, src: details.videoUrl } : null))
          .catch(() => null)
      )
    )
  ).filter(Boolean);

  return { latest, bestSelling, featured, videos };
}
