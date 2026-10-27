"use client";

import ShopListing from "@/components/shop/ShopListing";

// Same shop list as Products1, in a full-width container.
export default function Products10({ initialList = null }) {
  return <ShopListing containerClass="container-full2" initialList={initialList} />;
}
