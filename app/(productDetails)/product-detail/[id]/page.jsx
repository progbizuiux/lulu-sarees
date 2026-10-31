import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import Breadcumb from "@/components/productDetails/Breadcumb";
import Descriptions1 from "@/components/productDetails/descriptions/Descriptions1";
import Details1 from "@/components/productDetails/details/Details1";
import RelatedProducts from "@/components/productDetails/RelatedProducts";
import { productService } from "@/services/product.service";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { notFound } from "next/navigation";
import React, { cache } from "react";

// Loaded on the server, so search engines and link previews see the real product.
// cache() makes generateMetadata and the page share one request.
const getProduct = cache(async (id) => {
  try {
    return await productService.get(id);
  } catch (error) {
    // The ERP answers 400 "Product not found" (not 404) for an unknown product.
    if (error?.status === 404 || error?.status === 400) return null;
    throw error; // other errors show error.jsx (with a "Try again" button)
  }
});

const productPath = (product) => `/product-detail/${encodeURIComponent(product.id)}`;
const describe = (product) =>
  product.description ? product.description.slice(0, 160) : `Shop ${product.title} online at Lulu Sarees.`;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false, follow: true } };

  const description = describe(product);
  return {
    title: product.title, // the site template adds " | Lulu Sarees"
    description,
    alternates: { canonical: productPath(product) },
    openGraph: {
      title: product.title,
      description,
      url: productPath(product),
      images: product.imgSrc ? [{ url: product.imgSrc, alt: product.title }] : [],
    },
  };
}

/**
 * Product structured data (schema.org), so search results can show price and stock.
 * https://developers.google.com/search/docs/appearance/structured-data/product
 */
function productJsonLd(product) {
  const images = (product.images?.length ? product.images : [product.imgSrc]).filter(Boolean).map(absoluteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: describe(product),
    image: images,
    sku: String(product.id),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productPath(product)),
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound(); // shows the 404 page instead of a random product

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so text from the backend can never close this script tag (XSS safety).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c") }}
      />
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <Breadcumb product={product} />
      <Details1 product={product} />
      <Descriptions1 product={product} />
      <RelatedProducts product={product} />
      <Footer1 hasPaddingBottom />
    </>
  );
}
