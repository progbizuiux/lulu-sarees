"use client";

import { collectionData4 } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";

const items = collectionData4.map((item) => ({
  imgSrc: item.imgSrc,
  alt: item.title,
  title: item.title,
  href: "/shop-categories-top",
}));

export default function Categories() {
  return (
    <CategoryStrip
      title="Popular Categories"
      items={items}
      parentClass="flat-spacing-2"
      imgWidth={364}
      imgHeight={363}
    />
  );
}
