"use client";
import Link from "next/link";

/** Shown when the product couldn't be loaded (server down, timeout). Unknown products show the 404 page instead. */
export default function ProductError({ reset }) {
  return (
    <section className="flat-spacing">
      <div className="container text-center" style={{ minHeight: "40vh" }}>
        <h4 className="mb_12">We couldn't load this product</h4>
        <p className="text-secondary mb_24">Please check your connection and try again.</p>
        <div className="d-flex gap-12 justify-content-center flex-wrap">
          <button type="button" className="tf-btn btn-fill" onClick={() => reset()}>
            <span className="text text-button">Try again</span>
          </button>
          <Link href="/shop-default-grid" className="tf-btn btn-reset">
            Back to shop
          </Link>
        </div>
      </div>
    </section>
  );
}
