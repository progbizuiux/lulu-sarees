// Root layout: a server component, so it can set site-wide metadata.
// Browser-only behaviour (Bootstrap JS, the hiding header, scroll animations) lives in ClientEffects.

// Third-party CSS first, so the site's own styles (main.scss) can override it.
// Bundled here instead of CSS @import, which breaks if anything ends up above it in the stylesheet.
import "../public/fonts/font-icons.css";
import "../public/css/bootstrap.min.css";
import "../public/css/swiper-bundle.min.css";
import "../public/css/animate.css";
import "../public/css/bootstrap-select.min.css";
import "../public/scss/main.scss";
import "photoswipe/style.css";
import "react-range-slider-input/dist/style.css";
import "../public/css/image-compare-viewer.min.css";
// Required by Lenis: unpins html/body height and makes lenis.stop() really lock scrolling.
import "lenis/dist/lenis.css";
import { canela, satoshi } from "./fonts/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import ClientEffects from "@/components/common/ClientEffects";
import LenisProvider from "@/components/common/LenisProvider";
import Context from "@/context/Context";
import QueryProvider from "@/providers/QueryProvider";
import LazyModals from "@/components/common/LazyModals";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set a short title ("Silk Sarees"); the template adds the brand: "Silk Sarees | Lulu Sarees".
  title: {
    default: `${SITE_NAME} | Silk, Bridal & Designer Sarees Online`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [{ url: "/images/logo/lulu-logo.png", alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${canela.variable} ${satoshi.variable}`} suppressHydrationWarning>
      <body className="preload-wrapper popup-loader" suppressHydrationWarning>
        <QueryProvider>
          <LenisProvider>
            <Context>
              <div id="wrapper">{children}</div>
              {/* Popups load right after the page is interactive (see LazyModals). */}
              <LazyModals />
            </Context>
          </LenisProvider>
        </QueryProvider>
        <ClientEffects />
      </body>
    </html>
  );
}
