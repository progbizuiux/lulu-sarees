"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { exploreProducts, festiveProducts } from "@/data/products";
import ProductCard1 from "../productCards/ProductCard1";

// The store's own products (the template showed its demo products here).
const suggestedProducts = [...festiveProducts, ...exploreProducts];
// Each keyword runs that search (they used to link to "#").
const keywords = ["Silk sarees", "Kurta sets", "Lehengas", "Kasavu", "Kids"];

export default function SearchModal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Searching opens the search page with the results (/search-result?q=...).
  const handleSearch = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const query = String(new FormData(form).get("q") ?? "").trim();
    if (!query) return;
    const { Modal } = await import("bootstrap");
    Modal.getInstance(document.getElementById("search"))?.hide();
    form.reset();
    router.push(`/search-result?q=${encodeURIComponent(query)}`);
  };

  const [loadedItems, setLoadedItems] = useState(suggestedProducts.slice(0, 8));
  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => {
      setLoadedItems((pre) => [
        ...pre,
        ...suggestedProducts.slice(pre.length, pre.length + 4),
      ]);
      setLoading(false);
    }, 1000);
  };
  return (
    <div className="modal fade modal-search" id="search">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Search</h5>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <form className="form-search" onSubmit={handleSearch} role="search">
            <fieldset className="text">
              <input
                type="search"
                placeholder="Search for sarees, colours, fabrics…"
                className=""
                name="q"
                tabIndex={0}
                defaultValue=""
                aria-label="Search products"
                required
              />
            </fieldset>
            <button className="" type="submit">
              <svg
                className="icon"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.35 21.0004L17 16.6504"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          <div>
            <h5 className="mb_16">Feature keywords Today</h5>
            <ul className="list-tags">
              {keywords.map((keyword) => (
                <li key={keyword}>
                  <Link
                    href={`/search-result?q=${encodeURIComponent(keyword)}`}
                    className="radius-60 link"
                  >
                    {keyword}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h6 className="mb_16">Recently viewed products</h6>
            <div className="tf-grid-layout tf-col-2 lg-col-3 xl-col-4">
              {loadedItems.map((product, i) => (
                <ProductCard1 product={product} key={i} />
              ))}
            </div>
          </div>
          {/* Load Item */}

          {suggestedProducts.length == loadedItems.length ? (
            ""
          ) : (
            <div
              className="wd-load view-more-button text-center"
              onClick={() => handleLoad()}
            >
              <button
                className={`tf-loading btn-loadmore tf-btn btn-reset ${
                  loading ? "loading" : ""
                } `}
              >
                <span className="text text-btn text-btn-uppercase">
                  Load more
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
