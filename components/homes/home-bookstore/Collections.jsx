"use client";
import { collections14 } from "@/data/collections";
import React from "react";
import CategoryStrip from "@/components/common/CategoryStrip";

export default function Collections() {
  return (
    <CategoryStrip
      title="Shop by Categories"
      items={collections14.map((collection) => ({
        imgSrc: collection.imageSrc,
        alt: collection.title,
        title: collection.title,
        href: "/shop-collection",
      }))}
      parentClass=""
      imgWidth={380}
      imgHeight={380}
    />
  );
}
