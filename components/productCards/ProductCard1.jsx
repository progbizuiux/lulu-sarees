"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "../common/Countdown";
import { useContextElement } from "@/context/Context";
export default function ProductCard1({
  product,
  gridClass = "",
  parentClass = "card-product wow fadeInUp",
  isNotImageRatio = false,
  radiusClass = "",
}) {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);

  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
  } = useContextElement();

  useEffect(() => {
    setCurrentImage(product.imgSrc);
  }, [product]);

  return (
    // suppressHydrationWarning: the template's scroll animation (WOW.js) adds its own class and style to
    // this element, sometimes before React has taken over server-rendered cards. That's expected.
    <div
      suppressHydrationWarning
      className={`${parentClass} ${gridClass} ${
        product.isOnSale ? "on-sale" : ""
      } ${product.sizes ? "card-product-size" : ""}`}
    >
      <div
        className={`card-product-wrapper ${
          isNotImageRatio ? "aspect-ratio-0" : ""
        } ${radiusClass} `}
      >
        <Link href={`/product-detail/${product.id}`} className="product-img">
          {/* sizes: cards are about half the screen on phones, a third on tablets, a quarter on desktop,
              so the browser downloads a photo of the right size. */}
          <Image
            className="lazyload img-product"
            src={currentImage}
            alt={product.title}
            width={600}
            height={800}
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
          />

          {/* On hover the template hides the main photo and shows this one. Products without a second
              photo use the main photo here, so the card never goes blank on hover. */}
          {(product.imgHover || currentImage) && (
            <Image
              className="lazyload img-hover"
              src={product.imgHover || currentImage}
              alt={product.title}
              width={600}
              height={800}
              sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
            />
          )}
        </Link>
        {product.hotSale && (
          <div className="marquee-product bg-main">
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
            <div className="marquee-wrapper">
              <div className="initial-child-container">
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
                <div className="marquee-child-item">
                  <p className="font-2 text-btn-uppercase fw-6 text-white">
                    Hot Sale 25% OFF
                  </p>
                </div>
                <div className="marquee-child-item">
                  <span className="icon icon-lightning text-critical" />
                </div>
              </div>
            </div>
          </div>
        )}
        {product.isOnSale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-{product.salePercentage}</span>
          </div>
        )}
        {product.sizes && (
          <div className="variant-wrap size-list">
            <ul className="variant-box">
              {product.sizes.map((size) => (
                <li key={size} className="size-item">
                  {size}
                </li>
              ))}
            </ul>
          </div>
        )}
        {product.countdown && (
          <div className="variant-wrap countdown-wrap">
            <div className="variant-box">
              <div
                className="js-countdown"
                data-timer={product.countdown}
                data-labels="D :,H :,M :,S"
              >
                <CountdownTimer />
              </div>
            </div>
          </div>
        )}
        {product.oldPrice ? (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-25%</span>
          </div>
        ) : (
          ""
        )}
        <div className="list-product-btn">
          <a
            data-wished={isAddedtoWishlist(product.id) || undefined}
            onClick={() => addToWishlist(product.id)}
            className="box-icon wishlist btn-icon-action"
          >
            <span className="icon icon-heart" />
            <span className="tooltip">
              {isAddedtoWishlist(product.id)
                ? "Already Wishlished"
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
        <div className="list-btn-main">
          {product.addToCart == "Quick Add" ? (
            <a
              className="btn-main-product"
              href="#quickAdd"
              onClick={() => setQuickAddItem(product.id)}
              data-bs-toggle="modal"
            >
              Quick Add
            </a>
          ) : (
            <a
              className="btn-main-product"
              onClick={() => addProductToCart(product.id)}
            >
              {isAddedToCartProducts(product.id)
                ? "Already Added"
                : "ADD TO CART"}
            </a>
          )}
        </div>
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <span className="price">
          {product.oldPrice && (
            <span className="old-price">${product.oldPrice.toFixed(2)}</span>
          )}{" "}
          ${product.price?.toFixed(2)}
        </span>
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
      </div>
    </div>
  );
}
