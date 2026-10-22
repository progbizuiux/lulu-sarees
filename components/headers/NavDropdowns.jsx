"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { products } from "@/data/products";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import ProductCard1 from "../productCards/ProductCard1";
import { usePathname } from "next/navigation";
import {
  blogLinks,
  otherPageLinks,
  otherShopMenus,
  productFeatures,
  productLinks,
  productStyles,
  shopFeatures,
  shopLayout,
  swatchLinks,
} from "@/data/menu";

// The four hover dropdowns of the main navigation. Shared by Nav (old headers)
// and LuluNav (Lulu header). Each *Links list is what decides the "active" state.
export const sareesLinks = [
  ...shopLayout,
  ...shopFeatures,
  ...productStyles,
  ...otherShopMenus,
];
export const collectionsLinks = [
  ...productLinks,
  ...swatchLinks,
  ...productFeatures,
];
export const journalLinks = [...blogLinks];
export const storeLinks = [...otherPageLinks];

export const isActiveGroup = (links, pathname) =>
  links.some((elm) => elm.href.split("/")[1] == pathname.split("/")[1]);

export function SareesDropdown() {
  const pathname = usePathname();
  return (
    <div className="sub-menu mega-menu">
      <div className="container">
        <div className="row">
          <div className="col-lg-2">
            <div className="mega-menu-item">
              <div className="menu-heading">Shop Layout</div>
              <ul className="menu-list">
                {shopLayout.map((link, index) => (
                  <li
                    key={index}
                    className={`menu-item-li ${
                      pathname.split("/")[1] == link.href.split("/")[1]
                        ? "active"
                        : ""
                    } `}
                  >
                    <Link href={link.href} className="menu-link-text">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-2">
            <div className="mega-menu-item">
              <div className="menu-heading">Shop Features</div>
              <ul className="menu-list">
                {shopFeatures.map((link, index) => (
                  <li
                    key={index}
                    className={`menu-item-li ${
                      pathname.split("/")[1] == link.href.split("/")[1]
                        ? "active"
                        : ""
                    } `}
                  >
                    <Link href={link.href} className="menu-link-text">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-2">
            <div className="mega-menu-item">
              <div className="menu-heading">Products Hover</div>
              <ul className="menu-list">
                {productStyles.map((style, index) => (
                  <li
                    key={index}
                    className={`menu-item-li ${
                      pathname.split("/")[1] == style.href.split("/")[1]
                        ? "active"
                        : ""
                    } `}
                  >
                    <Link href={style.href} className="menu-link-text">
                      {style.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-2">
            <div className="mega-menu-item">
              <div className="menu-heading">My Pages</div>
              <ul className="menu-list">
                {otherShopMenus.map((link, index) => (
                  <li
                    key={index}
                    className={`menu-item-li ${
                      pathname.split("/")[1] == link.href.split("/")[1]
                        ? "active"
                        : ""
                    } `}
                  >
                    <Link href={link.href} className="menu-link-text">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="wrapper-sub-shop">
              <div className="menu-heading">Recent Products</div>
              <Swiper
                dir="ltr"
                className="swiper tf-product-header"
                slidesPerView={2}
                spaceBetween={20}
              >
                {products
                  .slice(0, 4)
                  .map((elm) => ({
                    ...elm,
                    colors: null,
                  }))
                  .map((elm, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <ProductCard1 product={elm} />
                    </SwiperSlide>
                  ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionsDropdown() {
  const pathname = usePathname();
  return (
    <div className="sub-menu mega-menu">
      <div className="container">
        <div className="row">
          <div className="col-lg-3">
            <div className="mega-menu-item">
              <div className="menu-heading">Products Layout</div>
              <ul className="menu-list">
                {productLinks.map((link, index) => (
                  <li
                    key={index}
                    className={`menu-item-li ${
                      pathname.split("/")[1] == link.href.split("/")[1]
                        ? "active"
                        : ""
                    } `}
                  >
                    <Link href={link.href} className="menu-link-text">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="mega-menu-item">
              <div className="menu-heading">Colors Swatched</div>
              <ul className="menu-list">
                {swatchLinks.map((link, index) => (
                  <li
                    key={index}
                    className={`menu-item-li ${
                      pathname.split("/")[1] == link.href.split("/")[1]
                        ? "active"
                        : ""
                    } `}
                  >
                    <Link href={link.href} className="menu-link-text">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="mega-menu-item">
              <div className="menu-heading">Products Features</div>
              <ul className="menu-list">
                {productFeatures.map((link, index) => (
                  <li
                    key={index}
                    className={`menu-item-li ${
                      pathname.split("/")[1] == link.href.split("/")[1]
                        ? "active"
                        : ""
                    } `}
                  >
                    <Link
                      href={link.href}
                      className={`menu-link-text ${
                        link.badge ? "position-relative" : ""
                      } `}
                    >
                      {link.name}
                      {link.badge && (
                        <div className="demo-label">
                          <span className="demo-new">{link.badge}</span>
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="menu-heading">Best seller</div>
            <div className="sec-cls-header">
              <div className="collection-position hover-img">
                <Link href={`/shop-collection`} className="img-style">
                  <Image
                    className="lazyload"
                    data-src="/images/collections/cls-header.jpg"
                    alt="banner-cls"
                    src="/images/collections/cls-header.jpg"
                    width={300}
                    height={400}
                  />
                </Link>
                <div className="content">
                  <div className="title-top">
                    <h4 className="title">
                      <Link
                        href={`/shop-collection`}
                        className="link text-white wow fadeInUp"
                      >
                        Shop our top picks
                      </Link>
                    </h4>
                    <p className="desc text-white wow fadeInUp">
                      Reserved for special occasions
                    </p>
                  </div>
                  <div>
                    <Link
                      href={`/shop-collection`}
                      className="tf-btn btn-md btn-white"
                    >
                      <span className="text">Shop Now</span>
                      <i className="icon icon-arrowUpRight" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function JournalDropdown() {
  const pathname = usePathname();
  return (
    <div className="sub-menu submenu-default">
      <ul className="menu-list">
        {blogLinks.map((link, index) => (
          <li
            key={index}
            className={`menu-item-li ${
              pathname.split("/")[1] == link.href.split("/")[1]
                ? "active"
                : ""
            } `}
          >
            <Link href={link.href} className="menu-link-text">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StoreDropdown() {
  const pathname = usePathname();
  return (
    <div className="sub-menu submenu-default">
      <ul className="menu-list">
        {otherPageLinks.map((link, index) => (
          <li
            key={index}
            className={`menu-item-li ${
              pathname.split("/")[1] == link.href.split("/")[1]
                ? "active"
                : ""
            } `}
          >
            <Link href={link.href} className="menu-link-text">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
