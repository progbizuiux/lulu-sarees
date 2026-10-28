"use client";
import { useContextElement } from "@/context/Context";
import { allProducts } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import SizeSelect from "../productDetails/SizeSelect";
import QuantitySelect from "../productDetails/QuantitySelect";
import { formatPrice } from "@/lib/format";
export default function QuickAdd() {
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState(null);
  const {
    quickAddItem,
    addProductToCart, buyNow,
    addToCompareItem,
    addToWishlist,
    isAddedtoWishlist,
    isAddedtoCompareItem,
  } = useContextElement();
  const [item, setItem] = useState(allProducts[0]);
  useEffect(() => {
    const found = allProducts.find((el) => el.id == quickAddItem);
    // (an unknown id used to set `undefined` here and crash the popup)
    if (found) {
      setItem(found);
      // start fresh for each product: quantity 1 and its first option in stock
      setQuantity(1);
      setVariantId(found.variants?.find((variant) => variant?.inStock)?.id ?? null);
    }
  }, [quickAddItem]);
  // Product options [{ id, name, price, inStock }]. (Some demo data has plain-text "variants": skipped.)
  const variants = (item.variants ?? []).filter((variant) => variant?.id != null);
  const variant = variants.find((option) => option.id === variantId);
  const price = variant?.price ?? item.price;
  return (
    <div className="modal fade modal-quick-add" id="quickAdd">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div>
            <div className="tf-product-info-list">
              <div className="tf-product-info-item">
                <div className="image">
                  <Image alt="" src={item.imgSrc} width={600} height={800} />
                </div>
                <div className="content">
                  <Link href={`/product-detail/${item.id}`}>{item.title}</Link>
                  <div className="tf-product-info-price">
                    <h5 className="price-on-sale font-2">
                      {formatPrice(price)}
                    </h5>
                    {item.oldPrice ? (
                      <>
                        <div className="compare-at-price font-2">
                          {formatPrice(item.oldPrice)}
                        </div>
                        {item.isOnSale && item.salePercentage && (
                          <div className="badges-on-sale text-btn-uppercase">
                            -{item.salePercentage}
                          </div>
                        )}
                      </>
                    ) : (
                      ""
                    )}
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
                      onClick={() => addProductToCart(item.id, quantity, true, variantId)}
                    >
                      <span>
                        {"Add to cart -"}
                        &nbsp;
                      </span>
                      <span className="tf-qty-price total-price">
                        {formatPrice(price * quantity)}
                      </span>
                    </a>
                    <a
                      href="#compare"
                      onClick={() => addToCompareItem(item.id)}
                      data-bs-toggle="offcanvas"
                      aria-controls="compare"
                      className="box-icon hover-tooltip compare btn-icon-action show-compare"
                    >
                      <span className="icon icon-gitDiff" />
                      <span className="tooltip text-caption-2">
                        {" "}
                        {isAddedtoCompareItem(item.id)
                          ? "Already compared"
                          : "Compare"}
                      </span>
                    </a>
                    <a
                      data-wished={isAddedtoWishlist(item.id) || undefined}
            onClick={() => addToWishlist(item.id)}
                      className="box-icon hover-tooltip text-caption-2 wishlist btn-icon-action"
                    >
                      <span className="icon icon-heart" />
                      <span className="tooltip text-caption-2">
                        {isAddedtoWishlist(item.id)
                          ? "In wishlist"
                          : "Wishlist"}
                      </span>
                    </a>
                  </div>
                  <a href="#" className="btn-style-3 text-btn-uppercase" onClick={(event) => { event.preventDefault(); buyNow(item.id, quantity, variantId); }}>
                    Buy it now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
