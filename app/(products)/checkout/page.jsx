import Footer1 from "@/components/footers/Footer1";
import LuluHeader from "@/components/headers/LuluHeader";
import Topbar6 from "@/components/headers/Topbar6";
import Checkout from "@/components/otherPages/Checkout";
import Link from "next/link";
import React from "react";
import { NO_INDEX } from "@/lib/site";

export const metadata = {
  title: "Checkout",
  robots: NO_INDEX,
};

export default function CheckoutPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <LuluHeader />
      <div
        className="page-title"
        style={{ backgroundImage: "url(/images/section/page-title.jpg)" }}
      >
        <div className="container">
          <h3 className="heading text-center">Check Out</h3>
          <ul className="breadcrumbs d-flex align-items-center justify-content-center">
            <li>
              <Link className="link" href={`/`}>
                Homepage
              </Link>
            </li>
            <li>
              <i className="icon-arrRight" />
            </li>
            <li>
              <Link className="link" href={`/shop-default-grid`}>
                Shop
              </Link>
            </li>
            <li>
              <i className="icon-arrRight" />
            </li>
            <li>View Cart</li>
          </ul>
        </div>
      </div>
      <Checkout />
      <Footer1 />
    </>
  );
}
