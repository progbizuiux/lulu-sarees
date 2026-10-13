"use client";

import { categories5 } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";

export default function Categories() {
  return (
    <CategoryStrip
      title="Popular Categories"
      items={categories5}
      href="/shop-categories-top"
      parentClass="flat-spacing-4"
      imgWidth={253}
      imgHeight={252}
    />
  );
}
