"use client";
import { Suspense, useState } from "react";
import LayoutHandler from "@/components/products/LayoutHandler";
import GridView from "@/components/products/GridView";
import Listview from "@/components/products/Listview";
import { useProducts } from "@/hooks/useProducts";
import { useShopFilters } from "@/hooks/useShopFilters";
import { toServiceParams, hasActiveFilters } from "@/lib/shop/filters";
import ShopSorting from "./ShopSorting";
import ShopFilterMeta from "./ShopFilterMeta";
import ShopFilterModal from "./ShopFilterModal";
import ShopPagination from "./ShopPagination";

function Spinner({ label }) {
  return (
    <div className="py-5 text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
    </div>
  );
}

/**
 * The shop product list: filters and sorting live in the URL, products come from the product
 * service (backend or mock), and every state is handled (loading, error, no results).
 */
export default function ShopListing(props) {
  // Next.js needs a Suspense boundary around anything that reads the URL's search params.
  return (
    <Suspense fallback={<Spinner label="Loading products…" />}>
      <ShopListingContent {...props} />
    </Suspense>
  );
}

function ShopListingContent({ parentClass = "flat-spacing", containerClass = "container" }) {
  const [activeLayout, setActiveLayout] = useState(4);
  const { filters, setFilters, clearFilters, pageHref } = useShopFilters();
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useProducts(
    toServiceParams(filters)
  );

  const items = data?.items ?? [];
  // Old results stay on screen (faded) while new ones load, so the grid doesn't jump.
  const isRefreshing = isFetching && isPlaceholderData;

  const pagination = data && data.totalPages > 1 && (
    <ul className={`wg-pagination ${activeLayout == 1 ? "" : "justify-content-center"}`}>
      <ShopPagination page={data.page} totalPages={data.totalPages} pageHref={pageHref} />
    </ul>
  );

  let content;
  if (isPending) {
    content = <Spinner label="Loading products…" />;
  } else if (isError) {
    content = (
      <div className="py-5 text-center">
        <p className="mb_12">{error?.message ?? "We couldn't load the products."}</p>
        <button type="button" className="tf-btn btn-fill" onClick={() => refetch()} disabled={isFetching}>
          <span className="text text-button">{isFetching ? "Trying again…" : "Try again"}</span>
        </button>
      </div>
    );
  } else if (!items.length) {
    content = (
      <div className="py-5 text-center">
        <p className="mb_12">
          {filters.page > 1 ? "There are no products on this page." : "No products match these filters."}
        </p>
        {filters.page > 1 ? (
          <button type="button" className="tf-btn btn-fill" onClick={() => setFilters({ page: 1 })}>
            <span className="text text-button">Go to the first page</span>
          </button>
        ) : (
          hasActiveFilters(filters) && (
            <button type="button" className="tf-btn btn-fill" onClick={clearFilters}>
              <span className="text text-button">Clear filters</span>
            </button>
          )
        )}
      </div>
    );
  } else if (activeLayout == 1) {
    content = (
      <div
        className="tf-list-layout wrapper-shop"
        id="listLayout"
        style={{ opacity: isRefreshing ? 0.5 : 1 }}
        aria-busy={isRefreshing}
      >
        <Listview products={items} pagination={false} />
        {pagination}
      </div>
    );
  } else {
    content = (
      <div
        className={`tf-grid-layout wrapper-shop tf-col-${activeLayout}`}
        id="gridLayout"
        style={{ opacity: isRefreshing ? 0.5 : 1 }}
        aria-busy={isRefreshing}
      >
        <GridView products={items} pagination={false} />
        {pagination}
      </div>
    );
  }

  return (
    <>
      <section className={parentClass}>
        <div className={containerClass}>
          <div className="tf-shop-control">
            <div className="tf-control-filter">
              <a
                href="#filterShop"
                data-bs-toggle="offcanvas"
                aria-controls="filterShop"
                className="tf-btn-filter"
              >
                <span className="icon icon-filter" />
                <span className="text">Filters</span>
              </a>
              <div
                role="button"
                aria-pressed={filters.onSale}
                onClick={() => setFilters({ onSale: !filters.onSale })}
                className={`d-none d-lg-flex shop-sale-text ${filters.onSale ? "active" : ""}`}
              >
                <i className="icon icon-checkCircle" />
                <p className="text-caption-1">Shop sale items only</p>
              </div>
            </div>
            <ul className="tf-control-layout">
              <LayoutHandler setActiveLayout={setActiveLayout} activeLayout={activeLayout} />
            </ul>
            <div className="tf-control-sorting">
              <p className="d-none d-lg-block text-caption-1">Sort by:</p>
              <ShopSorting value={filters.sort} onChange={(sort) => setFilters({ sort })} />
            </div>
          </div>
          <div className="wrapper-control-shop">
            <ShopFilterMeta
              total={data?.total ?? 0}
              isLoading={isPending}
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearFilters}
            />
            {content}
          </div>
        </div>
      </section>

      <ShopFilterModal
        filters={filters}
        facets={data?.facets}
        setFilters={setFilters}
        clearFilters={clearFilters}
      />
    </>
  );
}
