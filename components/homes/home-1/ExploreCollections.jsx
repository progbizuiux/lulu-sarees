"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import { exploreProducts } from "@/data/products";
import { useContextElement } from "@/context/Context";
import CartControl from "@/components/common/CartControl";
import { formatPrice } from "@/lib/format";

// label shown on the tab -> value used in products[].tabFilterOptions2
const tabs = [
  { label: "New Arrivals", filter: "New Arrivals" },
  { label: "Best Sellers", filter: "Best Seller" },
  { label: "On Sale", filter: "On Sale" },
];

const MAX_PRODUCTS = 8;

// Side gutter of the section; must match --explore-gutter in _explore-collections.scss
const slideBreakpoints = {
  0: { slidesPerView: 1.25, spaceBetween: 14, slidesOffsetBefore: 15, slidesOffsetAfter: 15 },
  480: { slidesPerView: 1.7, spaceBetween: 16, slidesOffsetBefore: 15, slidesOffsetAfter: 15 },
  640: { slidesPerView: 2.3, spaceBetween: 18, slidesOffsetBefore: 30, slidesOffsetAfter: 30 },
  900: { slidesPerView: 3, spaceBetween: 20, slidesOffsetBefore: 30, slidesOffsetAfter: 30 },
  1200: { slidesPerView: 3.5, spaceBetween: 24, slidesOffsetBefore: 50, slidesOffsetAfter: 50 },
  1600: { slidesPerView: 4.3, spaceBetween: 24, slidesOffsetBefore: 50, slidesOffsetAfter: 50 },
};

function ExploreProductCard({ product, isNew }) {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    setQuickViewItem,
    addProductToCart,
  } = useContextElement();

  useEffect(() => {
    setCurrentImage(product.imgSrc);
  }, [product]);

  const quickAdd = product.addToCart == "Quick Add";

  return (
    <article className="xc">
      <div className="xc__media">
        <Link
          href={`/product-detail/${product.id}`}
          className="xc__img-link"
          aria-label={product.title}
        >
          <Image
            className="xc__img"
            src={currentImage}
            alt={product.title}
            width={600}
            height={800}
          />
          {product.imgHover && (
            <Image
              className="xc__img xc__img--hover"
              src={product.imgHover}
              alt=""
              width={600}
              height={800}
            />
          )}
        </Link>

        {isNew && <span className="xc__badge">New</span>}

        <div className="xc__actions">
          <button
            type="button"
            className={`xc__action ${
              isAddedtoWishlist(product.id) ? "is-active" : ""
            }`}
            data-wished={isAddedtoWishlist(product.id) || undefined}
            onClick={() => addToWishlist(product.id)}
            aria-label={
              isAddedtoWishlist(product.id)
                ? "Already in wishlist"
                : "Add to wishlist"
            }
          >
            <span className="icon icon-heart" />
          </button>
          <a
            href="#quickView"
            className="xc__action"
            data-bs-toggle="modal"
            onClick={() => setQuickViewItem(product)}
            aria-label="Quick view"
          >
            <span className="icon icon-eye" />
          </a>
        </div>

        {quickAdd ? (
          <a
            href="#quickAdd"
            className="xc__cta"
            data-bs-toggle="modal"
            onClick={() => setQuickAddItem(product.id)}
          >
            Quick Add
          </a>
        ) : (
          <CartControl productId={product.id}>
            <button
              type="button"
              className="xc__cta"
              onClick={() => addProductToCart(product.id)}
            >
              {"Add to cart"}
            </button>
          </CartControl>
        )}
      </div>

      <div className="xc__info">
        <Link href={`/product-detail/${product.id}`} className="xc__title">
          {product.title}
        </Link>
        <p className="xc__price">
          {product.oldPrice && (
            <span className="xc__old-price">{formatPrice(product.oldPrice)}</span>
          )}
          {formatPrice(product.price)}
        </p>
        {product.colors && (
          <ul className="list-color-product">
            {product.colors.map((color, index) => (
              <li
                key={index}
                className={`list-color-item color-swatch ${
                  currentImage == color.imgSrc ? "active" : ""
                } ${color.bgColor == "bg-white" ? "line" : ""}`}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
              >
                <span className={`swatch-value ${color.bgColor}`} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/**
 * @param {{tabProducts?: Record<string, Array>}} props  ERP products per tab ("New Arrivals", "Best Seller",
 *   "On Sale"). Left out with demo data: the tabs then filter the demo products. Tabs with no products are
 *   hidden, and the whole section when none have any (the ERP has no "on sale" list yet).
 */
export default function ExploreCollections({ tabProducts }) {
  const visibleTabs = tabProducts ? tabs.filter((tab) => tabProducts[tab.filter]?.length) : tabs;
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.filter);
  // play the card entrance animation only after a tab change, not on first load
  const [switched, setSwitched] = useState(false);
  // auto scroll from the start, unless the visitor asked their system for less motion
  const autoScroll =
    typeof window === "undefined" ||
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const items = useMemo(
    () =>
      (tabProducts
        ? tabProducts[activeTab] ?? []
        : exploreProducts.filter((p) => p.tabFilterOptions2?.includes(activeTab))
      ).slice(0, MAX_PRODUCTS),
    [activeTab, tabProducts]
  );

  if (!visibleTabs.length) return null;

  return (
    <section className="explore" aria-labelledby="explore-title">
      <div className="explore__head">
        <div className="explore__intro">
          <h2 className="explore__title" id="explore-title">
            Explore Our Collections
          </h2>
          <p className="explore__subtitle">
            Discover the latest styles, timeless favourites, and pieces worth
            celebrating.
          </p>
        </div>
        <div className="explore__tabs" role="tablist" aria-label="Collections">
          {visibleTabs.map((tab) => (
            <button
              key={tab.filter}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.filter}
              className={`explore__tab ${
                activeTab === tab.filter ? "is-active" : ""
              }`}
              onClick={() => {
                setActiveTab(tab.filter);
                setSwitched(true);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="explore__slider">
        <Swiper
          key={activeTab}
          dir="ltr"
          className={`explore__swiper ${switched ? "is-switching" : ""}`}
          grabCursor
          modules={[Autoplay]}
          autoplay={
            autoScroll
              ? { delay: 3000, disableOnInteraction: true, pauseOnMouseEnter: true }
              : false
          }
          speed={800}
          slidesPerView={1.25}
          spaceBetween={14}
          breakpoints={slideBreakpoints}
        >
          <SwiperSlide>
            <div className="xp">
              <Image
                className="xp__img"
                src="/images/home/collection-img10.png"
                alt="Fresh styles for every day"
                width={600}
                height={800}
              />
              <div className="xp__body">
                <p className="xp__text">
                  Fresh styles for your everyday and special moments.
                </p>
                <Link href="/shop-default-grid" className="xp__btn">
                  View products
                </Link>
              </div>
            </div>
          </SwiperSlide>
          {items.map((product) => (
            <SwiperSlide key={product.id}>
              <ExploreProductCard
                product={product}
                isNew={activeTab === "New Arrivals"}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
