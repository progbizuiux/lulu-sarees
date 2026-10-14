"use client";

import { useId } from "react";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import Image from "next/image";
import Link from "next/link";
import { Navigation, A11y } from "swiper/modules";

const defaultBreakpoints = {
  1200: { slidesPerView: 6, spaceBetween: 20 },
  1000: { slidesPerView: 5, spaceBetween: 20 },
  768: { slidesPerView: 4, spaceBetween: 20 },
  576: { slidesPerView: 3, spaceBetween: 15 },
  0: { slidesPerView: 2, spaceBetween: 15 },
};

// Shared category strip: header row (title, arrows, view-all link) over a
// carousel of portrait cards. items: [{ imgSrc, alt, title, href? }]
export default function CategoryStrip({
  title,
  items,
  href = "/shop-collection",
  viewAllHref = "/shop-collection",
  viewAllLabel = "View All Collection",
  parentClass = "flat-spacing-2 pb_0",
  imgWidth = 363,
  imgHeight = 363,
  breakpoints = defaultBreakpoints,
}) {
  const uid = "cs" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <section className={parentClass}>
      <div className="container">
        <div className="category-head wow fadeInUp">
          <h3 className="category-title">{title}</h3>
          <div className="category-actions">
            <div className="category-nav">
              <button
                type="button"
                className={`category-arrow ${uid}-prev`}
                aria-label="Previous categories"
              >
                <i className="icon icon-arrLeft" />
              </button>
              <button
                type="button"
                className={`category-arrow ${uid}-next`}
                aria-label="Next categories"
              >
                <i className="icon icon-arrRight" />
              </button>
            </div>
            {viewAllHref && (
              <Link href={viewAllHref} className="category-viewall">
                {viewAllLabel}
              </Link>
            )}
          </div>
        </div>
        <div className="category-slider wow fadeInUp" data-wow-delay="0.1s">
          <Swiper
            dir="ltr"
            slidesPerView={2}
            spaceBetween={15}
            breakpoints={breakpoints}
            modules={[Navigation, A11y]}
            a11y={{
              prevSlideMessage: "Previous categories",
              nextSlideMessage: "Next categories",
            }}
            navigation={{
              prevEl: `.${uid}-prev`,
              nextEl: `.${uid}-next`,
            }}
          >
            {items.map((item, index) => (
              <SwiperSlide key={index}>
                <Link
                  href={item.href || href}
                  className="category-card hover-img"
                >
                  <div className="img-style category-img">
                    <Image
                      className="lazyload"
                      data-src={item.imgSrc}
                      alt={item.alt || item.title}
                      src={item.imgSrc}
                      width={imgWidth}
                      height={imgHeight}
                    />
                  </div>
                  <span className="category-name">{item.title}</span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
