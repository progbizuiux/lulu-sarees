"use client";
import { luluMenu } from "@/data/luluMenu";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import ProductCard1 from "../productCards/ProductCard1";
import Link from "next/link";
import { useProducts, useSuggestedProducts } from "@/hooks/useProducts";
import { useShopFilters } from "@/hooks/useShopFilters";
import { DEFAULT_PAGE_SIZE } from "@/lib/shop/filters";
import ShopPagination from "@/components/shop/ShopPagination";

// "Quick link:" items: the header menu's listings (the template had Fashion/Men/Women, all to one page).
const quickLinks = luluMenu.filter((item) => ["Sarees", "Men", "Women"].includes(item.label));

// Needed because the page reads ?q= from the URL.
export default function SearchProducts() {
  return (
    <Suspense fallback={null}>
      <SearchProductsContent />
    </Suspense>
  );
}

/** Results for ?q=, from the product service. */
function SearchResults({ query, page, pageHref }) {
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useProducts({
    search: query,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  if (isPending) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Searching…</span>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="py-5 text-center">
        <p className="mb_12">{error?.message}</p>
        <button type="button" className="tf-btn btn-fill" onClick={() => refetch()}>
          <span className="text text-button">Try again</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="text-center mb_24" aria-live="polite">
        {data.total === 0
          ? `No products found for “${query}”. Try a different word.`
          : `${data.total} ${data.total === 1 ? "product" : "products"} found for “${query}”`}
      </p>
      {data.items.length > 0 && (
        <div
          className="tf-grid-layout tf-col-2 md-col-3 xl-col-4"
          style={{ opacity: isFetching && isPlaceholderData ? 0.5 : 1 }}
        >
          {data.items.map((product) => (
            <ProductCard1 key={product.id} product={product} />
          ))}
          {data.totalPages > 1 && (
            <ul className="wg-pagination justify-content-center">
              <ShopPagination page={data.page} totalPages={data.totalPages} pageHref={pageHref} />
            </ul>
          )}
        </div>
      )}
    </>
  );
}

function SearchProductsContent() {
  const router = useRouter();
  const { filters, pageHref } = useShopFilters();
  const query = filters.search;
  // Shown before a search: the store's latest products (demo products in mock mode).
  const { data: recentProducts = [] } = useSuggestedProducts(4);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(value ? `/search-result?q=${encodeURIComponent(value)}` : "/search-result");
  };

  return (
    <>
      {/* search */}
      <section className="flat-spacing page-search-inner">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <form
                className="form-search"
                onSubmit={handleSearch}
                role="search"
              >
                <fieldset className="text">
                  <input
                    key={query}
                    type="search"
                    placeholder="Search for sarees, colours, fabrics…"
                    className=""
                    name="q"
                    tabIndex={0}
                    defaultValue={query}
                    aria-label="Search products"
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
              <div className="tf-col-quicklink">
                <span className="title">Quick link:</span>
                {quickLinks.map((item, i) => (
                  <React.Fragment key={item.label}>
                    {i > 0 && ","}
                    <Link className="link" href={item.href}>
                      {item.label}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /search */}
      {query ? (
        <section className="flat-spacing pt-0">
          <div className="container">
            <SearchResults query={query} page={filters.page} pageHref={pageHref} />
          </div>
        </section>
      ) : (
      // Shown until the customer searches: the home page's products, until there is a "recent/popular" API.
      <section className="flat-spacing pt-0">
        <div className="container">
          <div className="heading-section text-center">
            <h3 className="heading">Product Recent</h3>
          </div>
          <Swiper
            className="swiper tf-sw-latest"
            dir="ltr"
            spaceBetween={15}
            breakpoints={{
              0: { slidesPerView: 2, spaceBetween: 15 },

              768: { slidesPerView: 3, spaceBetween: 30 },
              1200: { slidesPerView: 4, spaceBetween: 30 },
            }}
            modules={[Pagination]}
            pagination={{
              clickable: true,
              el: ".spd4",
            }}
          >
            {recentProducts.slice(0, 4).map((product, i) => (
              <SwiperSlide key={i} className="swiper-slide">
                <ProductCard1 product={product} />
              </SwiperSlide>
            ))}

            <div className="sw-pagination-latest spd4  sw-dots type-circle justify-content-center" />
          </Swiper>
        </div>
      </section>
      )}
    </>
  );
}
