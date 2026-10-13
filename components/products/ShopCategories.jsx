"use client";

import { collections } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";

export default function ShopCategories() {
  return (
    <CategoryStrip
      title="Categories you might like"
      items={collections}
      parentClass="flat-spacing"
    />
  );
}
