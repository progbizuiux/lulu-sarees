"use client";
import { collectionsData3 } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";
export default function Collections() {
  return (
    <CategoryStrip
      title="Shop By Activity"
      items={collectionsData3.map((collection) => ({
        imgSrc: collection.image,
        alt: "collection-img",
        title: collection.title,
        href: "/shop-collection",
      }))}
      parentClass="flat-spacing-2"
      imgWidth={468}
      imgHeight={624}
    />
  );
}
