"use client";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { slides } from "@/data/heroSlides";
import Image from "next/image";
export default function Hero() {
  return (
    <section className="tf-slideshow slider-default slider-effect-fade">
      <Swiper
        effect="fade"
        spaceBetween={0}
        centeredSlides={false}
        slidesPerView={1}
        loop={true}
        modules={[EffectFade, Autoplay, Pagination]}
        // autoplay={{ delay: 3000 }}
        dir="ltr"
        pagination={{
          clickable: true,
          el: ".spd55",
        }}
        className="swiper tf-sw-slideshow"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="wrap-slider">
              <Image
                alt={slide.alt}
                src={slide.imgSrc}
                width={1920}
                height={803}
                priority
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots sw-pagination-slider type-circle white-circle justify-content-center spd55" />
        </div>
      </div>
    </section>
  );
}
