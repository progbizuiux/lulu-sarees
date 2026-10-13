"use client";

import { categories4 } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";

const items = categories4.map((category) => ({
  imgSrc: category.imgSrc,
  alt: category.title,
  title: category.title,
  href: "/shop-categories-top",
}));

export default function Categories() {
  return (
    <CategoryStrip
      title="Popular Categories"
      items={items}
      href="/shop-categories-top"
      parentClass="flat-spacing"
      imgWidth={286}
      imgHeight={285}
    />
  );
}
