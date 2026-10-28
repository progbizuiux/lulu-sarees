"use client";
import React from "react";
import Link from "next/link";
export default function Breadcumb({ product }) {
  return (
    <div className="tf-breadcrumb">
      <div className="container">
        <div className="tf-breadcrumb-wrap">
          <div className="tf-breadcrumb-list">
            <Link href={`/`} className="text text-caption-1">
              Homepage
            </Link>

            <i className="icon icon-arrRight" />
            <span className="text text-caption-1">{product.title}</span>
          </div>
          {/* The template's previous/next product arrows were removed: they guessed ids (id - 1 / id + 1)
              and led to missing or demo products. The grid icon goes back to the shop. */}
          <div className="tf-breadcrumb-prev-next">
            <Link
              href="/shop-default-grid"
              className="tf-breadcrumb-back"
              aria-label="Back to the shop"
            >
              <i className="icon icon-squares-four" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
