"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { festiveProducts } from "@/data/products";
import { useContextElement } from "@/context/Context";
import CartControl from "@/components/common/CartControl";
import { formatPrice } from "@/lib/format";
import { luluMenu } from "@/data/luluMenu";

// "Explore our collection" opens the header menu's Festive listing (it used to open the template's
// /shop-collection page, whose categories go nowhere).
const festiveHref =
  luluMenu.find((item) => item.label === "Festive")?.href ?? "/shop-default-grid";

function FestiveCard({ product }) {
  const { addProductToCart } = useContextElement();

  return (
    <article className="fe-card">
      <div className="fe-card__media">
        <Link
          href={`/product-detail/${product.id}`}
          className="fe-card__link"
          aria-label={product.title}
        >
          <Image
            className="fe-card__img"
            src={product.imgSrc}
            alt={product.title}
            width={600}
            height={870}
          />
        </Link>
        {product.isOnSale && <span className="fe-card__badge">Sale</span>}
        <CartControl productId={product.id}>
          <button
            type="button"
            className="fe-card__add"
            onClick={() => addProductToCart(product.id)}
            aria-label={`Add ${product.title} to cart`}
          >
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </CartControl>
      </div>
      <div className="fe-card__info">
        <Link href={`/product-detail/${product.id}`} className="fe-card__title">
          {product.title}
        </Link>
        <p className="fe-card__price">
          {formatPrice(product.price)}
          {product.oldPrice && (
            <span className="fe-card__old-price">{formatPrice(product.oldPrice)}</span>
          )}
        </p>
        {product.colors && (
          <ul className="list-color-product">
            {product.colors.map((color, i) => (
              <li
                key={i}
                className={`list-color-item color-swatch ${
                  i === 0 ? "active" : ""
                }`}
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

export default function FestiveEdit() {
  return (
    <section className="fe" aria-labelledby="fe-title">
      <div className="fe__inner">
        <div className="fe__feature">
          <div className="fe__card">
            <Image
              className="fe__banner"
              src="/images/home/festive-img.png"
              alt="The Festive Edit"
              width={4052}
              height={2872}
              sizes="(min-width: 992px) 55vw, 100vw"
            />
            <div className="fe__text">
              <div>
                <h2 className="fe__title" id="fe-title">
                  The Festive Edit
                </h2>
                <p className="fe__subtitle">
                  Make every celebration special with styles worth remembering.
                </p>
              </div>
              <Link href={festiveHref} className="fe__link">
                Explore our collection
              </Link>
            </div>
          </div>
        </div>

        <div className="fe__grid">
          {festiveProducts.map((product) => (
            <FestiveCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
