import Testimonials from "@/components/common/Testimonials";
import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Collections from "@/components/homes/fashion-modernRetreat/Collections";
import Hero from "@/components/homes/fashion-modernRetreat/Hero";
import Lookbook from "@/components/homes/fashion-modernRetreat/Lookbook";
import Products from "@/components/homes/fashion-modernRetreat/Products";
import Products2 from "@/components/homes/fashion-modernRetreat/Products2";
import MarqueeSection from "@/components/common/MarqueeSection2";
import React from "react";
import Features from "../../../components/common/Features2";

export const metadata = {
  title:
    "Home Fashion Modern Retreate || Modave - Multipurpose React Nextjs eCommerce Template",
  description: "Modave - Multipurpose React Nextjs eCommerce Template",
};

export default function HomeFashionModernRetreatPage() {
  return (
    <>
      <LuluHeader />
      <Hero />
      <Products />
      <Lookbook />
      <Products2 />
      <Testimonials parentClass="flat-spacing pt-0" />
      <Collections />
      <Features />
      <MarqueeSection />
      <Footer1 dark />
    </>
  );
}
