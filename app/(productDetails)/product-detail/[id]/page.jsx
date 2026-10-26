import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import Breadcumb from "@/components/productDetails/Breadcumb";
import Descriptions1 from "@/components/productDetails/descriptions/Descriptions1";
import Details1 from "@/components/productDetails/details/Details1";
import RelatedProducts from "@/components/productDetails/RelatedProducts";
import { productService } from "@/services/product.service";
import { notFound } from "next/navigation";
import React, { cache } from "react";

// Loaded on the server, so search engines and link previews see the real product.
// cache() makes generateMetadata and the page share one request.
const getProduct = cache(async (id) => {
  try {
    return await productService.get(id);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error; // other errors show error.jsx (with a "Try again" button)
  }
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found | Lulu Sarees" };

  const title = `${product.title} | Lulu Sarees`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Shop ${product.title} online at Lulu Sarees.`;

  return {
    title,
    description,
    openGraph: { title, description, images: product.imgSrc ? [product.imgSrc] : [] },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound(); // shows the 404 page instead of a random product

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <Breadcumb product={product} />
      <Details1 product={product} />
      <Descriptions1 />
      <RelatedProducts />
      <Footer1 hasPaddingBottom />
    </>
  );
}
