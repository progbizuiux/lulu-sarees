import Features from "@/components/common/Features";
import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import BannerCountdown from "@/components/homes/camping/BannerCountdown";
import BannerTab from "@/components/homes/camping/BannerTab";
import Blogs from "@/components/homes/camping/Blogs";
import Categories from "@/components/homes/camping/Categories";
import Hero from "@/components/homes/camping/Hero";
import Products from "@/components/homes/camping/Products";
import Shopgram from "@/components/homes/camping/Shopgram";
import SingleProduct from "@/components/homes/camping/SingleProduct";
import Testimonials from "@/components/homes/camping/Testimonials";
import React from "react";

export const metadata = {
  title:
    "Home Camping",
};

export default function HomeCampingPage() {
  return (
    <>
      <LuluHeader />
      <Hero />
      <Categories />
      <Products />
      <SingleProduct />
      <BannerTab />

      <Products />
      <BannerCountdown />
      <Testimonials />
      <Blogs />
      <Features parentClass="flat-spacing pt-0" />
      <Shopgram />
      <Footer1 border={false} />
    </>
  );
}
