import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import OrderSuccess from "@/components/otherPages/OrderSuccess";
import React from "react";

export const metadata = {
  title: "Order placed | Lulu Sarees",
  // A personal confirmation page: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <OrderSuccess />
      <Footer1 />
    </>
  );
}
