"use client";

import { exploreProducts, festiveProducts } from "@/data/products";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import ProductCard1 from "../productCards/ProductCard1";
import { Pagination } from "swiper/modules";

// The same products the home page shows. The sale badge is worked out from the old price,
// the same way the shop does it.
const suggestions = [...exploreProducts, ...festiveProducts].map((product) => {
  const onSale = product.oldPrice > product.price;
  return {
    ...product,
    isOnSale: onSale,
    salePercentage: onSale ? `${Math.round((1 - product.price / product.oldPrice) * 100)}%` : undefined,
  };
});

export default function RecentProducts() {
  return (
    <section className="flat-spacing pt-0">
      <div className="container">
        <div className="heading-section text-center wow fadeInUp">
          <h4 className="heading">You may also like</h4>
        </div>
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
            el: ".spd79",
          }}
        >
          {suggestions.map((product) => (
            <SwiperSlide key={product.id} className="swiper-slide">
              <ProductCard1 product={product} />
            </SwiperSlide>
          ))}

          <div className="sw-pagination-latest sw-dots type-circle justify-content-center spd79" />
        </Swiper>
      </div>
    </section>
  );
}
