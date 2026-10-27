import Features2 from "@/components/common/Features2";
import MarqueeSection2 from "@/components/common/MarqueeSection2";
import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar2 from "@/components/headers/Topbar2";
import BannerTab from "@/components/common/BannerTab2";
import Blogs from "@/components/homes/beauty/Blogs";
import Categories from "@/components/common/Categories";
import Collections from "@/components/homes/beauty/Collections";
import Hero from "@/components/homes/beauty/Hero";
import Products from "@/components/common/Products5";
import ShopGram from "@/components/common/ShopGram4";
import Testimonials from "@/components/common/Testimonials3";
import Tiktok from "@/components/common/Tiktok";
import React from "react";

export const metadata = {
  title: "Home Beauty",
};

export default function HomeBeautyPage() {
  return (
    <>
      <Topbar2 parentClass="tf-topbar topbar-white bg-purple-2" />
      <LuluHeader />
      <Hero />
      <Collections />
      <Categories />
      <MarqueeSection2 />
      <Products />
      <BannerTab />
      <Tiktok />
      <Testimonials />
      <Blogs />
      <Features2 parentClass="flat-spacing pt-0" />
      <ShopGram />
      <Footer1 dark />
    </>
  );
}
