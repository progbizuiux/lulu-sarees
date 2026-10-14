"use client";

import { useId, useRef } from "react";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import Image from "next/image";
import Link from "next/link";
import { Navigation, A11y } from "swiper/modules";

// Split banner: a cream panel with a centred pattern carousel on the left and
// a full-height photo on the right.
// items: [{ imgSrc, title, href? }]
export default function PatternShowcase({
  subheading,
  heading,
  items,
  sideImgSrc,
  sideImgAlt = "",
  href = "/shop-collection",
}) {
  const uid = "ps" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const swiperRef = useRef(null);

  // Only the centred card is a live link; tapping a side card slides it to the middle.
  const handleCardClick = (e) => {
    const slide = e.currentTarget.closest(".swiper-slide");
    if (slide && !slide.classList.contains("swiper-slide-active")) {
      e.preventDefault();
      const index = Number(slide.getAttribute("data-swiper-slide-index"));
      swiperRef.current?.slideToLoop(index);
    }
  };

  return (
    <section className="pattern-showcase">
      <div className="pattern-panel">
        <div className="pattern-head wow fadeInUp">
          <p className="pattern-sub">{subheading}</p>
          <h3 className="pattern-title">{heading}</h3>
        </div>
        <div className="pattern-slider wow fadeInUp" data-wow-delay="0.1s">
          <Swiper
            dir="ltr"
            slidesPerView={3}
            spaceBetween={6}
            centeredSlides={true}
            loop={true}
            modules={[Navigation, A11y]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            a11y={{
              prevSlideMessage: "Previous pattern",
              nextSlideMessage: "Next pattern",
            }}
            navigation={{
              prevEl: `.${uid}-prev`,
              nextEl: `.${uid}-next`,
            }}
          >
            {items.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="pattern-card">
                  <Link
                    href={item.href || href}
                    className="pattern-img"
                    onClick={handleCardClick}
                  >
                    <Image
                      src={item.imgSrc}
                      alt={item.title}
                      width={640}
                      height={800}
                    />
                    <span className="pattern-name">{item.title}</span>
                  </Link>
                  <Link href={item.href || href} className="pattern-btn">
                    Shop Now
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="pattern-nav">
          <button
            type="button"
            className={`pattern-arrow ${uid}-prev`}
            aria-label="Previous pattern"
          >
            <i className="icon icon-arrLeft" />
          </button>
          <button
            type="button"
            className={`pattern-arrow ${uid}-next`}
            aria-label="Next pattern"
          >
            <i className="icon icon-arrRight" />
          </button>
        </div>
      </div>
      <div className="pattern-side">
        <Image src={sideImgSrc} alt={sideImgAlt} width={1600} height={1067} />
      </div>
    </section>
  );
}
