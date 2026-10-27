import Features from "@/components/common/Features";
import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import BannerCountdown from "@/components/homes/organic/BannerCountdown";
import Collections from "@/components/homes/organic/Collections";
import Hero from "@/components/homes/organic/Hero";
import Products1 from "@/components/homes/organic/Products1";
import Products2 from "@/components/homes/organic/Products2";
import ShopGram from "@/components/homes/organic/ShopGram";
import Testimonials from "@/components/homes/organic/Testimonials";
import React from "react";

export const metadata = {
  title:
    "Home Organic",
};

export default function HomeOrganicPage() {
  return (
    <>
      <LuluHeader />

      <Hero />
      <Products1 />
      <Collections />
      <BannerCountdown />
      <Products2 />
      <Testimonials />
      <Features parentClass="flat-spacing pt-0" />
      <ShopGram />
      <Footer1 border={false} />
    </>
  );
}
