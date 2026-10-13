"use client";
import { collections16 } from "@/data/collections";
import React from "react";
import CategoryStrip from "@/components/common/CategoryStrip";
export default function Categories() {
  const items = collections16.map((collection) => ({
    imgSrc: collection.imageSrc,
    alt: collection.title,
    title: collection.title,
    href: "/shop-default-grid",
  }));
  return (
    <CategoryStrip
      title="Shop By Categories"
      items={items}
      parentClass="flat-spacing"
      imgWidth={450}
      imgHeight={600}
    />
  );
}
