"use client";
import { collections13 } from "@/data/collections";
import React from "react";
import CategoryStrip from "@/components/common/CategoryStrip";

const items = collections13.map((collection) => ({
  imgSrc: collection.imageSrc,
  alt: "collection-img",
  title: collection.title,
  href: "/shop-categories-top",
}));

export default function Categories() {
  return (
    <CategoryStrip
      title="Trending Categories"
      items={items}
      viewAllHref="/shop-collection"
      viewAllLabel="View All Products"
      parentClass="flat-spacing"
      imgWidth={300}
      imgHeight={300}
    />
  );
}
