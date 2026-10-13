"use client";
import React from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";

export default function Topbar4() {
  return (
    <div className="tf-topbar style-2 line-bt">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-xl-3 d-none d-xl-block">
            <ul className="tf-social-icon style-fill">
              <li>
                <a href="#" className="social-facebook">
                  <i className="icon icon-fb" />
                </a>
              </li>
              <li>
                <a href="#" className="social-twiter">
                  <i className="icon icon-x" />
                </a>
              </li>
              <li>
                <a href="#" className="social-instagram">
                  <i className="icon icon-instagram" />
                </a>
              </li>
              <li>
                <a href="#" className="social-tiktok">
                  <i className="icon icon-tiktok" />
                </a>
              </li>
              <li>
                <a href="#" className="social-amazon">
                  <i className="icon icon-amazon" />
                </a>
              </li>
              <li>
                <a href="#" className="social-pinterest">
                  <i className="icon icon-pinterest" />
                </a>
              </li>
            </ul>
          </div>
          <div className="col-xl-6 col-12 text-center">
            <Swiper
              className="swiper tf-sw-top_bar"
              modules={[Autoplay]}
              loop
              speed={1000}
              autoplay={{
                delay: 2000,
              }}
              dir="ltr"
            >
              <SwiperSlide className="swiper-slide">
                <p className="top-bar-text text-line-clamp-1 text-btn-uppercase fw-semibold letter-1">
                  Free shipping on all orders over
                  <span className="text-primary">$20.00</span>
                </p>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <p className="top-bar-text text-line-clamp-1 text-btn-uppercase fw-semibold letter-1">
                  Midseason Sale: 20% Off - Auto Applied at Checkout - Limited
                  Time Only.
                </p>
              </SwiperSlide>
            </Swiper>
          </div>
          <div className="col-xl-3 d-none d-xl-block">
          </div>
        </div>
      </div>
    </div>
  );
}
