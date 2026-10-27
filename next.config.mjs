// Image hosts the backend serves product photos from (e.g. a CDN), comma-separated, without https://.
// Example: IMAGE_HOSTNAMES=cdn.lulusarees.com,lulusarees.blob.core.windows.net
const imageHostnames = (process.env.IMAGE_HOSTNAMES || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Image optimisation is on: Next.js resizes photos to the size each screen needs and serves
    // modern formats (WebP), instead of sending the full-size originals (some are over 20 MB).
    remotePatterns: imageHostnames.map((hostname) => ({ protocol: "https", hostname })),
    // Product photos rarely change: let browsers and the CDN keep resized copies for a week.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  poweredByHeader: false, // don't advertise the framework in response headers
  sassOptions: {
    quietDeps: true, // This will silence deprecation warnings
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
