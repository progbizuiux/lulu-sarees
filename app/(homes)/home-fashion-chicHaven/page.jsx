import Brands from "@/components/common/Brands";
import Features from "@/components/common/Features";
import Products2 from "@/components/common/Products2";
import Products4 from "@/components/common/Products4";
import ShopGram from "@/components/common/ShopGram";
import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Collections from "@/components/homes/fashion-chicHaven/Collections";
import Hero from "@/components/homes/fashion-chicHaven/Hero";
import MarqueeSection from "@/components/common/MarqueeSection";
import SingleProduct from "@/components/homes/fashion-chicHaven/SingleProduct";
import React from "react";

export const metadata = {
  title:
    "Home Fashion Chichaven",
};

export default function HomeFashionChicHavenPage() {
  return (
    <>
      <LuluHeader />
      <Hero />
      <Collections />
      <Products4 parentClass="flat-spacing" />
      <MarqueeSection />
      <SingleProduct />
      <Products2 title="Top Trending" parentClass="flat-spacing" />
      <Features parentClass="flat-spacing pt-0 line-bottom-container" />
      <Testimonials />
      <ShopGram parentClass="flat-spacing pt-0" />

      <Brands parentClass="flat-spacing-5 line-top mt--5" />
      <Footer1 dark />
    </>
  );
}
