import Categories from "@/components/common/Categories";
import Features from "@/components/common/Features";
import MarqueeSection2 from "@/components/common/MarqueeSection2";
import Products5 from "@/components/common/Products5";
import Tiktok from "@/components/common/Tiktok";
import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar4 from "@/components/headers/Topbar4";
import Hero from "@/components/homes/skincare/Hero";
import Lookbook from "@/components/homes/skincare/Lookbook";
import ShopGram from "@/components/homes/skincare/ShopGram";
import SingleProduct from "@/components/homes/skincare/SingleProduct";
import SkinBeforeAfter from "@/components/homes/skincare/SkinBeforeAfter";
import Testimonials from "@/components/common/Testimonials2";
import React from "react";

export const metadata = {
  title:
    "Home Skillcare",
};

export default function HomeSkincarePage() {
  return (
    <>
      <Topbar4 />
      <LuluHeader />
      <Hero />

      <Tiktok parentClass="flat-spacing" />
      <Categories />
      <MarqueeSection2 />
      <Products5 />
      <Lookbook />
      <Testimonials />
      <SkinBeforeAfter />
      <SingleProduct />
      <Features />
      <ShopGram parentClass="flat-spacing pt-0" />
      <Footer1 />
    </>
  );
}
