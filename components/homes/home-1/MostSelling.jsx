import React from "react";
import Image from "next/image";
import Link from "next/link";
import { mostSellingProducts } from "@/data/products";

// The design shows prices as $98.00 / $219.99.
function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

export default function MostSelling() {
  return (
    <section className="ms" aria-labelledby="ms-title">
      <div className="ms__head">
        <h2 className="ms__title" id="ms-title">
          Most Selling
        </h2>
        <span className="ms__line" aria-hidden="true" />
      </div>

      <div className="ms__grid">
        {mostSellingProducts.map((product) => (
          <article className="ms-card" key={product.id}>
            <Link
              href={`/product-detail/${product.id}`}
              className="ms-card__media"
              aria-label={product.title}
            >
              <Image
                className="ms-card__img"
                src={product.imgSrc}
                alt={product.title}
                width={778}
                height={798}
                sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw"
              />
              {product.isOnSale && (
                <span className="ms-card__badge">-{product.salePercentage}</span>
              )}
            </Link>
            <Link href={`/product-detail/${product.id}`} className="ms-card__title">
              {product.title}
            </Link>
            <p className="ms-card__price">
              {product.oldPrice && (
                <span className="ms-card__old-price">{formatPrice(product.oldPrice)}</span>
              )}
              {formatPrice(product.price)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
