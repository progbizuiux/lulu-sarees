"use client";
import { collectionItems4 } from "@/data/collections";
import React from "react";
import CategoryStrip from "@/components/common/CategoryStrip";
export default function Categories({ parentClass = "flat-spacing pt-0" }) {
  return (
    <CategoryStrip
      title="Shop by product type"
      items={collectionItems4}
      parentClass={parentClass}
      imgWidth={285}
      imgHeight={285}
    />
  );
}
