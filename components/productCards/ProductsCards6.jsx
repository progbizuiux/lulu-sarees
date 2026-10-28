"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "../common/Countdown";

import { useContextElement } from "@/context/Context";
import CartControl from "@/components/common/CartControl";
import { formatPrice } from "@/lib/format";

// "-21%" badge from the product's own sale data (its salePercentage, or worked out from oldPrice).
function saleLabel(product) {
  if (product.isOnSale && product.salePercentage) return product.salePercentage;
  if (product.oldPrice > product.price) {
    return `${Math.round((1 - product.price / product.oldPrice) * 100)}%`;
  }
  return null;
}

export default function ProductsCards6({ product }) {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const sale = saleLabel(product);

  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
    setQuickViewItem,
    addProductToCart,
  } = useContextElement();

  useEffect(() => {
    setCurrentImage(product.imgSrc);
  }, [product]);
  return (
    <div
      className="card-product style-list"
      data-availability="In stock"
      data-brand="gucci"
    >
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={currentImage}
            alt={product.title}
            width={600}
            height={800}
          />
          {/* Products without a second photo use the main photo, so the card never goes blank on hover. */}
          <Image
            className="lazyload img-hover"
            src={product.imgHover || currentImage}
            alt={product.title}
            width={600}
            height={800}
          />
        </Link>
        {sale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-{sale}</span>
          </div>
        )}
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <span className="price current-price">
          {product.oldPrice > product.price && (
            <span className="old-price">{formatPrice(product.oldPrice)}</span>
          )}{" "}
          {formatPrice(product.price)}
        </span>
        {/* The product's own description (the template showed the same demo text on every card). */}
        {product.description && (
          <p className="description text-secondary text-line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="variant-wrap-list">
          {product.colors && (
            <ul className="list-color-product">
              {product.colors.map((color, index) => (
                <li
                  key={index}
                  className={`list-color-item color-swatch ${
                    currentImage == color.imgSrc ? "active" : ""
                  } `}
                  onMouseOver={() => setCurrentImage(color.imgSrc)}
                >
                  <span className={`swatch-value ${color.bgColor}`} />
                  <Image
                    className="lazyload"
                    src={color.imgSrc}
                    alt="color variant"
                    width={600}
                    height={800}
                  />
                </li>
              ))}
            </ul>
          )}
          {product.sizes && (
            <div className="size-box list-product-btn">
              {/* the product's own sizes (the template always showed S–XXL) */}
              {product.sizes.map((size) => (
                <span key={size} className="size-item box-icon">
                  {size}
                </span>
              ))}
            </div>
          )}
          <div className="list-product-btn">
            <CartControl productId={product.id}>
              <a
                onClick={() => addProductToCart(product.id)}
                className="btn-main-product"
              >
                {"Add To cart"}
              </a>
            </CartControl>
            <a
              data-wished={isAddedtoWishlist(product.id) || undefined}
            onClick={() => addToWishlist(product.id)}
              className="box-icon wishlist btn-icon-action"
            >
              <span className="icon icon-heart" />
              <span className="tooltip">
                {isAddedtoWishlist(product.id)
                  ? "In wishlist"
                  : "Wishlist"}
              </span>
            </a>
            <a
              href="#compare"
              data-bs-toggle="offcanvas"
              aria-controls="compare"
              onClick={() => addToCompareItem(product.id)}
              className="box-icon compare btn-icon-action"
            >
              <span className="icon icon-gitDiff" />
              <span className="tooltip">
                {" "}
                {isAddedtoCompareItem(product.id)
                  ? "Already compared"
                  : "Compare"}
              </span>
            </a>
            <a
              href="#quickView"
              onClick={() => setQuickViewItem(product)}
              data-bs-toggle="modal"
              className="box-icon quickview tf-btn-loading"
            >
              <span className="icon icon-eye" />
              <span className="tooltip">Quick View</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
