"use client";
import React, { forwardRef, useId } from "react";
import { Swiper as BaseSwiper, SwiperSlide } from "swiper/react";

// Swiper only sizes its slides once its JS has loaded, so on first paint every
// slide is full width. This wrapper prints the initial slide sizes as CSS (same
// values Swiper will use) and they stop applying as soon as Swiper initializes.
const toNumber = (v) => (typeof v === "number" && isFinite(v) ? v : null);

const slideRule = (cls, perView, gap) =>
  `.${cls}:not(.swiper-initialized) .swiper-slide{width:calc((100% - ${
    gap * (perView - 1)
  }px) / ${perView});margin-right:${gap}px}`;

function buildCss(cls, props) {
  if (props.direction === "vertical" || props.grid) return "";
  const basePerView = props.slidesPerView === undefined ? 1 : props.slidesPerView;
  const baseGap = props.spaceBetween === undefined ? 0 : props.spaceBetween;
  let css = "";
  const basePv = toNumber(basePerView);
  const baseGp = toNumber(baseGap);
  if (basePv && baseGp !== null && basePv > 0) {
    css += slideRule(cls, basePv, baseGp);
  }
  const bps = props.breakpoints || {};
  Object.keys(bps)
    .map(Number)
    .filter((w) => !isNaN(w))
    .sort((a, b) => a - b)
    .forEach((w) => {
      const bp = bps[w] || {};
      const pv = toNumber(bp.slidesPerView ?? basePerView);
      const gp = toNumber(bp.spaceBetween ?? baseGap);
      if (pv && gp !== null && pv > 0) {
        css += `@media (min-width:${w}px){${slideRule(cls, pv, gp)}}`;
      }
    });
  return css;
}

const Swiper = forwardRef(function Swiper(props, ref) {
  const cls = "ssr" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const css = buildCss(cls, props);
  return (
    <BaseSwiper
      {...props}
      ref={ref}
      className={`${props.className ? props.className + " " : ""}${cls}`}
    >
      {css && <style slot="container-start">{css}</style>}
      {props.children}
    </BaseSwiper>
  );
});

export { Swiper, SwiperSlide };
