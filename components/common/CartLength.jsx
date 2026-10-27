"use client";

import { useContextElement } from "@/context/Context";

/** Number of items in the cart (total quantity), shown on the cart icon. */
export default function CartLength() {
  const { cartCount } = useContextElement();
  return <>{cartCount}</>;
}
