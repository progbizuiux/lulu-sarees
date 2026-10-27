import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import OrderSuccess from "@/components/otherPages/OrderSuccess";
import React from "react";
import { NO_INDEX } from "@/lib/site";

export const metadata = {
  title: "Order placed",
  robots: NO_INDEX,
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
