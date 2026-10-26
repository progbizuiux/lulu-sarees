"use client";

import { useWishlist } from "@/hooks/useWishlist";
import ProductCard1 from "../productCards/ProductCard1";
import Link from "next/link";

// Wishlist products come from the wishlist service (backend or mock). Guests can have one too.
export default function Wishlist() {
  const { data: wishlist, isPending, isError, error, refetch } = useWishlist();
  const items = wishlist?.items ?? [];

  return (
    <section className="flat-spacing">
      <div className="container">
        {isPending ? (
          <div className="py-5 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading your wishlist…</span>
            </div>
          </div>
        ) : isError ? (
          <div className="p-5 text-center">
            <p className="mb-3">{error?.message}</p>
            <button type="button" className="tf-btn btn-fill" onClick={() => refetch()}>
              <span className="text text-button">Try again</span>
            </button>
          </div>
        ) : items.length ? (
          <div className="tf-grid-layout tf-col-2 md-col-3 xl-col-4">
            {items.map((product) => (
              <ProductCard1 key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-5">
            Your wishlist is empty. Start adding your favorite products to save
            them for later!{" "}
            <Link className="btn-line" href="/shop-default-grid">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
