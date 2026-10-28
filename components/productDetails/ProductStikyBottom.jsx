"use client";
import { useContextElement } from "@/context/Context";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import QuantitySelect from "./QuantitySelect";

// Sticky "Add to cart" bar for the product on the page. `variant`: the option chosen on the page, if any.
export default function ProductStikyBottom({ product, variant }) {
  const { addProductToCart } = useContextElement();
  const [quantity, setQuantity] = useState(1); // Initial quantity is 1
  const [show, setShow] = useState(false);

  // Slides the bar up once the page's own "Add to cart" buttons have scrolled out of view.
  useEffect(() => {
    const mainButtons = document.querySelector(".tf-main-product .tf-product-info-by-btn");
    if (!mainButtons) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(mainButtons);
    return () => observer.disconnect();
  }, []);

  if (!product) return null;
  const price = variant?.price ?? product.price;

  return (
    <div className={`tf-sticky-btn-atc ${show ? "show" : ""}`}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <form
              className="form-sticky-atc"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="tf-sticky-atc-product">
                <div className="image">
                  <Image
                    className="lazyload"
                    alt={product.title}
                    src={product.imgSrc}
                    width={600}
                    height={800}
                  />
                </div>
                <div className="content">
                  <div className="text-title">{product.title}</div>
                  {variant && (
                    <div className="text-caption-1 text-secondary-2">
                      {variant.name}
                    </div>
                  )}
                  <div className="text-title">{formatPrice(price)}</div>
                </div>
              </div>
              <div className="tf-sticky-atc-infos">
                <div className="tf-sticky-atc-quantity d-flex gap-12 align-items-center">
                  <div className="tf-sticky-atc-infos-title text-title">
                    Quantity:
                  </div>
                  <QuantitySelect
                    styleClass="style-1"
                    quantity={quantity}
                    setQuantity={setQuantity}
                  />
                </div>
                <div className="tf-sticky-atc-btns">
                  <a
                    onClick={() =>
                      addProductToCart(product.id, quantity, true, variant?.id ?? null)
                    }
                    className="tf-btn w-100 btn-reset radius-4 btn-add-to-cart"
                  >
                    <span className="text text-btn-uppercase">
                      {" "}
                      {"Add to cart -"}
                    </span>
                    <span className="tf-qty-price total-price">
                      {formatPrice(price * quantity)}
                    </span>
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
