"use client";

import { useContextElement } from "@/context/Context";

/** Number of items in the wishlist, shown on the heart icon. */
export default function WishlistLength() {
  const { wishList } = useContextElement();
  return <>{wishList.length}</>;
}
