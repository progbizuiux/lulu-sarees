// Site-wide settings used for SEO (metadata, sitemap, robots, structured data).

/** The live site's address, without a trailing slash. Set NEXT_PUBLIC_SITE_URL in each environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "Lulu Sarees";

export const SITE_DESCRIPTION =
  "Shop handpicked silk, Kerala kasavu, bridal, festive and designer sarees online at Lulu Sarees.";

/** Turns "/images/x.jpg" into a full URL (search engines and link previews need full URLs). */
export const absoluteUrl = (path) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** For pages that shouldn't appear in search results (account, checkout, login…). */
export const NO_INDEX = { index: false, follow: true };
