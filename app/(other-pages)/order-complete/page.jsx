import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import OrderComplete from "@/components/otherPages/OrderComplete";
import React from "react";
import { NO_INDEX } from "@/lib/site";

export const metadata = {
  title: "Order Status",
  robots: NO_INDEX,
};

// After paying online, the ERP's payment page sends the shopper here: /order-complete?order=<orderID>
export default function OrderCompletePage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <OrderComplete />
      <Footer1 />
    </>
  );
}
