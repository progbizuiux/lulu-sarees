"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import { Pagination } from "swiper/modules";
import { exploreProducts, festiveProducts } from "@/data/products";
import ProductCard1 from "../productCards/ProductCard1";
import { config } from "@/lib/config";

// The store's own products (the template showed demo T-shirts and sunglasses here),
// with the same sale fields the shop pages get, so the cards show the right sale badge.
const storeProducts = [...exploreProducts, ...festiveProducts].map((product) => {
  const isOnSale = product.oldPrice > product.price;
  return {
    ...product,
    isOnSale,
    salePercentage: isOnSale
      ? `${Math.round((1 - product.price / product.oldPrice) * 100)}%`
      : undefined,
  };
});

// Recently viewed products, newest first, kept in this browser only. A small copy of each product
// is stored (not just its id), so it works with any product, demo or from the ERP.
const RECENT_KEY = "lulu-recently-viewed";

const snapshot = (item) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  price: item.price,
  oldPrice: item.oldPrice,
  isOnSale: item.isOnSale,
  salePercentage: item.salePercentage,
  imgSrc: item.imgSrc,
  imgHover: item.imgHover,
  inStock: item.inStock,
  variantId: item.variantId ?? null,
});

/** @param {{product?: Object}} props  On the real API, "Related Products" are the ERP's related products. */
export default function RelatedProducts({ product }) {
  const params = useParams();
  const currentId = String(product?.id ?? params?.id);
  const related = config.useMocks
    ? storeProducts.filter((item) => String(item.id) !== currentId)
    : (product?.related ?? []).filter((item) => String(item.id) !== currentId);

  // "Recently Viewed": products this shopper opened before. The tab shows once there are some.
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch {
      // storage blocked or unreadable: start empty
    }
    // Older versions stored only ids: those are dropped.
    const others = saved.filter((item) => item && typeof item === "object" && String(item.id) !== currentId);
    setRecent(others);
    if (!product) return;
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify([snapshot(product), ...others].slice(0, 12)));
    } catch {
      // storage blocked: nothing is remembered
    }
  }, [currentId, product]);

  const showRelated = related.length > 0;
  if (!showRelated && !recent.length) return null;

  return (
    <section className="flat-spacing">
      <div className="container flat-animate-tab">
        <ul
          className="tab-product justify-content-sm-center wow fadeInUp"
          data-wow-delay="0s"
          role="tablist"
        >
          {showRelated && (
            <li className="nav-tab-item" role="presentation">
              <a href="#ralatedProducts" className="active" data-bs-toggle="tab">
                Related Products
              </a>
            </li>
          )}
          {recent.length > 0 && (
            <li className="nav-tab-item" role="presentation">
              <a href="#recentlyViewed" className={showRelated ? "" : "active"} data-bs-toggle="tab">
                Recently Viewed
              </a>
            </li>
          )}
        </ul>
        <div className="tab-content">
          {showRelated && (
          <div
            className="tab-pane active show"
            id="ralatedProducts"
            role="tabpanel"
          >
            <Swiper
              className="swiper tf-sw-latest"
              dir="ltr"
              spaceBetween={15}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 15 },

                768: { slidesPerView: 3, spaceBetween: 30 },
                1200: { slidesPerView: 4, spaceBetween: 30 },
              }}
              modules={[Pagination]}
              pagination={{
                clickable: true,
                el: ".spd4",
              }}
            >
              {related.map((item) => (
                <SwiperSlide key={item.id} className="swiper-slide">
                  <ProductCard1 product={item} />
                </SwiperSlide>
              ))}

              <div className="sw-pagination-latest spd4  sw-dots type-circle justify-content-center" />
            </Swiper>
          </div>
          )}
          {recent.length > 0 && (
            <div className={`tab-pane ${showRelated ? "" : "active show"}`} id="recentlyViewed" role="tabpanel">
              <Swiper
                className="swiper tf-sw-latest"
                dir="ltr"
                spaceBetween={15}
                breakpoints={{
                  0: { slidesPerView: 2, spaceBetween: 15 },

                  768: { slidesPerView: 3, spaceBetween: 30 },
                  1200: { slidesPerView: 4, spaceBetween: 30 },
                }}
                modules={[Pagination]}
                pagination={{
                  clickable: true,
                  el: ".spd5",
                }}
              >
                {recent.map((item) => (
                  <SwiperSlide key={item.id} className="swiper-slide">
                    <ProductCard1 product={item} />
                  </SwiperSlide>
                ))}

                <div className="sw-pagination-latest spd5  sw-dots type-circle justify-content-center" />
              </Swiper>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
