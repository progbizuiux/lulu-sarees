"use client";

import { collections8 } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";

export default function Collections() {
  const items = collections8.map((item) => ({
    imgSrc: item.imgSrc,
    alt: item.title,
    title: item.title,
  }));

  return (
    <CategoryStrip
      title="Top Collection"
      items={items}
      href="/shop-collection"
      parentClass="flat-spacing"
    />
  );
}
