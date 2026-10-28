"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import SizeSelect from "../productDetails/SizeSelect";
import Grid5 from "../productDetails/grids/Grid5";
import { useContextElement } from "@/context/Context";
import QuantitySelect from "../productDetails/QuantitySelect";
import { formatPrice } from "@/lib/format";

// First option that's in stock (colour/size), or null for products without options.
const firstInStock = (product) => product?.variants?.find((variant) => variant?.inStock)?.id ?? null;

export default function QuickView() {
  const [activeColor, setActiveColor] = useState("gray");
  const [quantity, setQuantity] = useState(1); // Initial quantity is 1
  const [variantId, setVariantId] = useState(null);
  const {
    quickViewItem,
    addProductToCart, buyNow,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  // The popup stays on the page, so start fresh for each product (quantity 1, its first option).
  useEffect(() => {
    setActiveColor("gray");
    setQuantity(1);
    setVariantId(firstInStock(quickViewItem));
  }, [quickViewItem]);

  const openModalSizeChoice = () => {
    const bootstrap = require("bootstrap"); // dynamically import bootstrap
    var myModal = new bootstrap.Modal(document.getElementById("size-guide"), {
      keyboard: false,
    });

    myModal.show();
    document
      .getElementById("size-guide")
      .addEventListener("hidden.bs.modal", () => {
        myModal.hide();
      });
    const backdrops = document.querySelectorAll(".modal-backdrop");
    if (backdrops.length > 1) {
      // Apply z-index to the last backdrop
      const lastBackdrop = backdrops[backdrops.length - 1];
      lastBackdrop.style.zIndex = "1057";
    }
  };

  // No product chosen yet: keep the empty popup in the page so Bootstrap can open it.
  if (!quickViewItem) {
    return (
      <div className="modal fullRight fade modal-quick-view" id="quickView">
        <div className="modal-dialog">
          <div className="modal-content" />
        </div>
      </div>
    );
  }

  // Product options [{ id, name, price, inStock }]. (Some demo data has plain-text "variants": skipped.)
  const variants = (quickViewItem.variants ?? []).filter((variant) => variant?.id != null);
  const variant = variants.find((item) => item.id === variantId);
  const price = variant?.price ?? quickViewItem.price;
  const category =
    typeof quickViewItem.category === "string"
      ? quickViewItem.category
      : quickViewItem.category?.name;

  return (
    <div className="modal fullRight fade modal-quick-view" id="quickView">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* key: new photos (and scroll position) for each product */}
          <Grid5
            key={quickViewItem.id}
            firstItem={quickViewItem.imgSrc}
            slideItems={quickViewItem.gallery}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
          />
          <div className="wrap mw-100p-hidden">
            <div className="header">
              <h5 className="title">Quick View</h5>
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="tf-product-info-list">
              <div className="tf-product-info-heading">
                <div className="tf-product-info-name">
                  {category && (
                    <div className="text text-btn-uppercase">{category}</div>
                  )}
                  <h3 className="name">{quickViewItem.title}</h3>
                  <div className="sub">
                    <div className="tf-product-info-rate">
                      <div className="list-star">
                        <i className="icon icon-star" />
                        <i className="icon icon-star" />
                        <i className="icon icon-star" />
                        <i className="icon icon-star" />
                        <i className="icon icon-star" />
                      </div>
                      <div className="text text-caption-1">(134 reviews)</div>
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
                      {formatPrice(price)}
                    </h5>
                    {quickViewItem.oldPrice ? (
                      <>
                        <div className="compare-at-price font-2">
                          {" "}
                          {formatPrice(quickViewItem.oldPrice)}
                        </div>
                        {quickViewItem.isOnSale && quickViewItem.salePercentage && (
                          <div className="badges-on-sale text-btn-uppercase">
                            -{quickViewItem.salePercentage}
                          </div>
                        )}
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                  {quickViewItem.description && <p>{quickViewItem.description}</p>}
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
                      className="btn-style-2 flex-grow-1 text-btn-uppercase fw-6 show-shopping-cart"
                      onClick={() =>
                        addProductToCart(quickViewItem.id, quantity, true, variantId)
                      }
                    >
                      <span>
                        {"Add to cart -"}
                      </span>
                      <span className="tf-qty-price total-price">
                        {formatPrice(price * quantity)}
                      </span>
                    </a>
                    <a
                      href="#compare"
                      onClick={() => addToCompareItem(quickViewItem.id)}
                      data-bs-toggle="offcanvas"
                      aria-controls="compare"
                      className="box-icon hover-tooltip compare btn-icon-action show-compare"
                    >
                      <span className="icon icon-gitDiff" />
                      <span className="tooltip text-caption-2">
                        {" "}
                        {isAddedtoCompareItem(quickViewItem.id)
                          ? "Already compared"
                          : "Compare"}
                      </span>
                    </a>
                    <a
                      data-wished={isAddedtoWishlist(quickViewItem.id) || undefined}
            onClick={() => addToWishlist(quickViewItem.id)}
                      className="box-icon hover-tooltip text-caption-2 wishlist btn-icon-action"
                    >
                      <span className="icon icon-heart" />
                      <span className="tooltip text-caption-2">
                        {isAddedtoWishlist(quickViewItem.id)
                          ? "In wishlist"
                          : "Wishlist"}
                      </span>
                    </a>
                  </div>
                  <a href="#" className="btn-style-3 text-btn-uppercase" onClick={(event) => { event.preventDefault(); buyNow(quickViewItem.id, quantity, variantId); }}>
                    Buy it now
                  </a>
                </div>
                <div>
                  <Link
                    href={`/product-detail/${quickViewItem.id}`}
                    className="text-btn-uppercase link text-decoration-underline"
                  >
                    View full details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
