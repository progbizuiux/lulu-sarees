"use client";

import { categories3 } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";

export default function Categories() {
  return (
    <CategoryStrip
      title="Popular Categories"
      items={categories3.map((category) => ({
        imgSrc: category.imgSrc,
        alt: category.title,
        title: category.title,
      }))}
      href="/shop-categories-top"
      parentClass="flat-spacing pt-0"
      imgWidth={380}
      imgHeight={380}
    />
  );
}
