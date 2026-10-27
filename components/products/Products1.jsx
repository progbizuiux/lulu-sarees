"use client";

import ShopListing from "@/components/shop/ShopListing";

// The shop product list used by the menu's shop pages. Products come from the product service,
// with filters, sorting and pages kept in the URL. See components/shop/ShopListing.jsx.
// `initialList`: products already loaded on the server for this URL (optional).
export default function Products1({ parentClass = "flat-spacing", initialList = null }) {
  return <ShopListing parentClass={parentClass} initialList={initialList} />;
}
