"use client";
import React from "react";
import Image from "next/image";
import { Autoplay, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";

// TODO: the third review uses placeholder photos until its images are supplied.
const stories = [
  {
    rating: 5,
    quote:
      "Absolutely love this outfit! The fabric feels soft and comfortable, while the fit is flattering without feeling restrictive. The design is elegant and easy to style for both casual days and special occasions. The quality is even better in person, and I've already received so many compliments.",
    name: "Amelia Carter",
    product: "Product: Elegant Ethnic Wear",
    photo: "/images/home/testimonial-4.png",
    thumb: "/images/home/testimonial-1.png",
  },
  {
    rating: 5,
    quote:
      "Absolutely love these trousers! The fit is flattering and comfortable, while the fabric feels premium and lightweight.",
    name: "Amelia Carter",
    product: "Stylish Trousers",
    photo: "/images/home/testimonial-3.png",
    thumb: "/images/home/testimonial-2.png",
  },
  {
    rating: 4,
    quote:
      "Excellent overall experience. The outfit is comfortable to wear and the quality feels great for the price. Highly recommend!",
    name: "Amelia Carter",
    product: "Everyday Fashion",
    photo: "/images/products/womens/women-19.jpg",
    thumb: "/images/products/womens/women-19.jpg",
  },
];

// slidesOffsetBefore/After = the section gutter (see --cs-gutter in _customer-stories.scss)
const breakpoints = {
  0: { spaceBetween: 14, slidesOffsetBefore: 15, slidesOffsetAfter: 15 },
  768: { spaceBetween: 18, slidesOffsetBefore: 30, slidesOffsetAfter: 30 },
  1200: { spaceBetween: 20, slidesOffsetBefore: 50, slidesOffsetAfter: 50 },
};

function Stars({ count }) {
  return (
    <div className="cs-card__stars" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M12 2.5l2.95 6.1 6.7.9-4.9 4.65 1.2 6.65L12 17.5l-5.95 3.3 1.2-6.65-4.9-4.65 6.7-.9z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}

export default function CustomerStories() {
  // auto scroll from the start, unless the visitor asked their system for less motion
  const autoScroll =
    typeof window === "undefined" ||
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <section className="cs" aria-labelledby="cs-title">
      <div className="cs__head">
        <h2 className="cs__title" id="cs-title">
          The Stories That Make Us Special
        </h2>
        <p className="cs__subtitle">Real stories, happy customers.</p>
      </div>

      <Swiper
        dir="ltr"
        className="cs__swiper"
        modules={[Autoplay, Scrollbar]}
        autoplay={
          autoScroll
            ? { delay: 2000, disableOnInteraction: true, pauseOnMouseEnter: true }
            : false
        }
        speed={800}
        grabCursor
        slidesPerView="auto"
        spaceBetween={14}
        breakpoints={breakpoints}
        scrollbar={{ el: ".cs__scrollbar", draggable: true }}
      >
        {stories.map((story, i) => (
          <SwiperSlide key={i} className="cs__slide">
            <article className="cs-card">
              <div className="cs-card__body">
                <Stars count={story.rating} />
                <p className="cs-card__quote">“{story.quote}”</p>
                <div className="cs-card__author">
                  <Image
                    className="cs-card__avatar"
                    src={story.thumb}
                    alt=""
                    width={96}
                    height={96}
                  />
                  <div>
                    <p className="cs-card__name">{story.name}</p>
                    <p className="cs-card__product">{story.product}</p>
                  </div>
                </div>
              </div>
              <div className="cs-card__photo">
                <Image
                  src={story.photo}
                  alt={story.product.replace("Product: ", "")}
                  width={1033}
                  height={1246}
                  sizes="(min-width: 1200px) 13vw, 40vw"
                />
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="cs__scrollbar" aria-hidden="true" />
    </section>
  );
}
