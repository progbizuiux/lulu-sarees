"use client";
import { slides } from "@/data/collections";
import CategoryStrip from "@/components/common/CategoryStrip";
export default function Collections2() {
  return (
    <CategoryStrip
      title="Our Featured Offers"
      items={slides.map(({ imgSrc, alt, heading }) => ({
        imgSrc,
        alt,
        title: heading,
        href: "/shop-default-grid",
      }))}
      href="/shop-default-grid"
      viewAllHref="/shop-default-grid"
      viewAllLabel="See All Offers"
      parentClass="flat-spacing-4 pt-0"
      imgWidth={361}
      imgHeight={360}
    />
  );
}
