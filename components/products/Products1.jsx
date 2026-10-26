"use client";

import ShopListing from "@/components/shop/ShopListing";

// The shop product list used by the menu's shop pages. Products come from the product service,
// with filters, sorting and pages kept in the URL. See components/shop/ShopListing.jsx.
export default function Products1({ parentClass = "flat-spacing" }) {
  return <ShopListing parentClass={parentClass} />;
}
