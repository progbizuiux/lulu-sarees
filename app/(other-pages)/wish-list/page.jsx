import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import Wishlist from "@/components/otherPages/Wishlist";
import React from "react";
import { NO_INDEX } from "@/lib/site";

export const metadata = {
  title: "Wishlist",
  robots: NO_INDEX,
};

export default function WishListPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <Wishlist />

      <Footer1 />
    </>
  );
}
