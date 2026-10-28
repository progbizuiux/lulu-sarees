"use client";

import { collections2 } from "@/data/collections";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";

const defaultBreakpoints = {
  0: { slidesPerView: 2, spaceBetween: 15 },
  568: { slidesPerView: 3, spaceBetween: 20 },
  968: { slidesPerView: 4, spaceBetween: 20 },
  1224: { slidesPerView: 5, spaceBetween: 20 },
};

export default function ShopCategories2({
  items = collections2,
  breakpoints = defaultBreakpoints,
}) {
  return (
    <section className="flat-spacing">
      <div className="container">
        <Swiper
          dir="ltr"
          spaceBetween={15}
          className="swiper tf-sw-categories"
          breakpoints={breakpoints}
        >
          {items.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="collection-position-2 hover-img">
                {/* The photo opens the category too (it used to be a link to nowhere). Items without
                    their own href open the full shop: /shop-collection only has template categories. */}
                <Link href={slide.href || "/shop-default-grid"} className="img-style" tabIndex={-1} aria-hidden="true">
                  <Image
                    className="lazyload"
                    data-src={slide.imgSrc}
                    alt={slide.alt}
                    src={slide.imgSrc}
                    width={363}
                    height={483}
                  />
                </Link>
                <div className="content">
                  <Link href={slide.href || "/shop-default-grid"} className="cls-btn">
                    <h6 className="text">{slide.text}</h6>
                    <i className="icon icon-arrowUpRight" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
