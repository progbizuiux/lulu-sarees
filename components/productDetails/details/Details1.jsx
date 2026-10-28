"use client";
import React, { useState } from "react";
import Link from "next/link";
import Slider1 from "../sliders/Slider1";
import SizeSelect from "../SizeSelect";
import QuantitySelect from "../QuantitySelect";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import { formatPrice } from "@/lib/format";
import { notify } from "@/lib/notify";

// "Share": the device's share sheet where there is one, otherwise copy the page link.
async function shareLink(title) {
  const url = window.location.href;
  try {
    if (navigator.share) return await navigator.share({ title, url });
  } catch (error) {
    if (error?.name === "AbortError") return; // share sheet closed
  }
  try {
    await navigator.clipboard.writeText(url);
    notify("Link copied.", { type: "success" });
  } catch {
    notify("Couldn't copy the link. Please copy it from the address bar.", { type: "error" });
  }
}

// "Delivery & Return": opens the "Shipping & Returns" tab below (Descriptions1 listens for this).
function showShippingTab(event) {
  if (!document.getElementById("product-tabs")) return; // no tabs on this page: plain link
  event.preventDefault();
  window.dispatchEvent(new Event("show-shipping-tab"));
}

export default function Details1({ product }) {
  const [activeColor, setActiveColor] = useState("gray");
  const [quantity, setQuantity] = useState(1);
  // The product's options (colour/size). Starts on the first one in stock; none for products without options.
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState(
    () => variants.find((variant) => variant.inStock)?.id ?? null
  );
  const variant = variants.find((item) => item.id === variantId);
  const price = variant?.price ?? product.price;
  const category =
    typeof product.category === "string" ? product.category : product.category?.name;
  const {
    addProductToCart, buyNow,
    addToWishlist,
    isAddedtoWishlist,
    isAddedtoCompareItem,
    addToCompareItem,
  } = useContextElement();

  return (
    <section className="flat-spacing">
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            {/* Product default */}
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <Slider1
                  setActiveColor={setActiveColor}
                  activeColor={activeColor}
                  firstItem={product.imgSrc}
                  slideItems={product.gallery}
                />
              </div>
            </div>
            {/* /Product default */}
            {/* tf-product-info-list */}
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative mw-100p-hidden ">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-heading">
                    <div className="tf-product-info-name">
                      {category && (
                        <div className="text text-btn-uppercase">{category}</div>
                      )}
                      <h3 className="name">{product.title}</h3>
                      <div className="sub">
                        <div className="tf-product-info-rate">
                          <div className="list-star">
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                          </div>
                          <div className="text text-caption-1">
                            (134 reviews)
                          </div>
                        </div>
                        <div className="tf-product-info-sold">
                          <i className="icon icon-lightning" />
                          <div className="text text-caption-1">
                            18&nbsp;sold in last&nbsp;32&nbsp;hours
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="tf-product-info-desc">
                      <div className="tf-product-info-price">
                        <h5 className="price-on-sale font-2">
                          {" "}
                          {formatPrice(price)}
                        </h5>
                        {product.oldPrice ? (
                          <>
                            <div className="compare-at-price font-2">
                              {" "}
                              {formatPrice(product.oldPrice)}
                            </div>
                            {product.isOnSale && product.salePercentage && (
                              <div className="badges-on-sale text-btn-uppercase">
                                -{product.salePercentage}
                              </div>
                            )}
                          </>
                        ) : (
                          ""
                        )}
                      </div>
                      {product.description && <p>{product.description}</p>}
                      <div className="tf-product-info-liveview">
                        <i className="icon icon-eye" />
                        <p className="text-caption-1">
                          <span className="liveview-count">28</span> people are
                          viewing this right now
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="tf-product-info-choose-option">
                    {/* Colour/size picker: only for products that have options */}
                    {variants.length > 0 && (
                      <SizeSelect
                        variants={variants}
                        selectedId={variantId}
                        onSelect={setVariantId}
                      />
                    )}
                    <div className="tf-product-info-quantity">
                      <div className="title mb_12">Quantity:</div>
                      <QuantitySelect
                        quantity={quantity}
                        setQuantity={setQuantity}
                      />
                    </div>
                    <div>
                      <div className="tf-product-info-by-btn mb_10">
                        <a
                          onClick={() =>
                            addProductToCart(product.id, quantity, true, variantId)
                          }
                          className="btn-style-2 flex-grow-1 text-btn-uppercase fw-6 btn-add-to-cart"
                        >
                          <span>
                            {"Add to cart -"}
                          </span>
                          <span className="tf-qty-price total-price">
                            {formatPrice(price * quantity)}{" "}
                          </span>
                        </a>
                        <a
                          href="#compare"
                          data-bs-toggle="offcanvas"
                          aria-controls="compare"
                          onClick={() => addToCompareItem(product.id)}
                          className="box-icon hover-tooltip compare btn-icon-action"
                        >
                          <span className="icon icon-gitDiff" />
                          <span className="tooltip text-caption-2">
                            {isAddedtoCompareItem(product.id)
                              ? "Already compared"
                              : "Compare"}
                          </span>
                        </a>
                        <a
                          data-wished={isAddedtoWishlist(product.id) || undefined}
            onClick={() => addToWishlist(product.id)}
                          className="box-icon hover-tooltip text-caption-2 wishlist btn-icon-action"
                        >
                          <span className="icon icon-heart" />
                          <span className="tooltip text-caption-2">
                            {isAddedtoWishlist(product.id)
                              ? "In wishlist"
                              : "Wishlist"}
                          </span>
                        </a>
                      </div>
                      <a href="#" className="btn-style-3 text-btn-uppercase" onClick={(event) => { event.preventDefault(); buyNow(product.id, quantity, variantId); }}>
                        Buy it now
                      </a>
                    </div>
                    <div className="tf-product-info-help">
                      <div className="tf-product-info-extra-link">
                        <a
                          href="#product-tabs"
                          onClick={showShippingTab}
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-shipping" />
                          </div>
                          <p className="text-caption-1">
                            Delivery &amp; Return
                          </p>
                        </a>
                        <Link href="/contact" className="tf-product-extra-icon">
                          <div className="icon">
                            <i className="icon-question" />
                          </div>
                          <p className="text-caption-1">Ask A Question</p>
                        </Link>
                        <a
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            shareLink(product.title);
                          }}
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-share" />
                          </div>
                          <p className="text-caption-1">Share</p>
                        </a>
                      </div>
                      <div className="tf-product-info-time">
                        <div className="icon">
                          <i className="icon-timer" />
                        </div>
                        <p className="text-caption-1">
                          Estimated Delivery:&nbsp;&nbsp;<span>12-26 days</span>
                          (International), <span>3-6 days</span> (United States)
                        </p>
                      </div>
                      <div className="tf-product-info-return">
                        <div className="icon">
                          <i className="icon-arrowClockwise" />
                        </div>
                        <p className="text-caption-1">
                          Return within <span>45 days</span> of purchase. Duties
                          &amp; taxes are non-refundable.
                        </p>
                      </div>
                      <div className="dropdown dropdown-store-location">
                        <div
                          className="dropdown-title dropdown-backdrop"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                        >
                          <div className="tf-product-info-view link">
                            <div className="icon">
                              <i className="icon-map-pin" />
                            </div>
                            <span>View Store Information</span>
                          </div>
                        </div>
                        <div className="dropdown-menu dropdown-menu-end">
                          <div className="dropdown-content">
                            <div className="dropdown-content-heading">
                              <h5>Store Location</h5>
                              <i className="icon icon-close" />
                            </div>
                            <div className="line-bt" />
                            <div>
                              <h6>Fashion Modave</h6>
                              <p>Pickup available. Usually ready in 24 hours</p>
                            </div>
                            <div>
                              <p>766 Rosalinda Forges Suite 044,</p>
                              <p>Gracielahaven, Oregon</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul className="tf-product-info-sku">
                      {product.sku && (
                        <li>
                          <p className="text-caption-1">SKU:</p>
                          <p className="text-caption-1 text-1">{product.sku}</p>
                        </li>
                      )}
                      <li>
                        <p className="text-caption-1">Vendor:</p>
                        <p className="text-caption-1 text-1">Lulu Sarees</p>
                      </li>
                      <li>
                        <p className="text-caption-1">Available:</p>
                        <p className="text-caption-1 text-1">
                          {product.inStock ? "In stock" : "Out of stock"}
                        </p>
                      </li>
                      {category && (
                        <li>
                          <p className="text-caption-1">Categories:</p>
                          <p className="text-caption-1">
                            <Link href="/shop-default-grid" className="text-1 link">
                              {category}
                            </Link>
                          </p>
                        </li>
                      )}
                    </ul>
                    <div className="tf-product-info-guranteed">
                      <div className="text-title">Guaranteed safe checkout:</div>
                      {/* payment logos are pictures, not links (they had href="#", which jumped to the top) */}
                      <div className="tf-payment">
                        <a>
                          <Image
                            alt=""
                            src="/images/payment/img-1.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a>
                          <Image
                            alt=""
                            src="/images/payment/img-2.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a>
                          <Image
                            alt=""
                            src="/images/payment/img-3.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a>
                          <Image
                            alt=""
                            src="/images/payment/img-4.png"
                            width={98}
                            height={64}
                          />
                        </a>
                        <a>
                          <Image
                            alt=""
                            src="/images/payment/img-5.png"
                            width={102}
                            height={64}
                          />
                        </a>
                        <a>
                          <Image
                            alt=""
                            src="/images/payment/img-6.png"
                            width={98}
                            height={64}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /tf-product-info-list */}
          </div>
        </div>
      </div>
    </section>
  );
}
