"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RangeSlider from "react-range-slider-input";
import { AVAILABILITY_OPTIONS } from "@/lib/shop/filters";
import { formatPrice } from "@/lib/format";
import { colorSwatch } from "./colorSwatch";

const PRICE_DEBOUNCE_MS = 500;

/**
 * The filter side panel (template markup). Options and counts come from the backend ("facets"),
 * so it only offers choices that exist. Sections with no options are hidden.
 */
export default function ShopFilterModal({ filters, facets, setFilters, clearFilters }) {
  const pathname = usePathname();
  const bounds = facets?.priceRange ?? { min: 0, max: 1000 };

  // The slider moves freely; the URL (and the API call) only changes once the customer stops dragging.
  const [price, setPrice] = useState([filters.minPrice ?? bounds.min, filters.maxPrice ?? bounds.max]);

  useEffect(() => {
    setPrice([filters.minPrice ?? bounds.min, filters.maxPrice ?? bounds.max]);
  }, [filters.minPrice, filters.maxPrice, bounds.min, bounds.max]);

  useEffect(() => {
    const [min, max] = price;
    const nextMin = min <= bounds.min ? undefined : min;
    const nextMax = max >= bounds.max ? undefined : max;
    if (nextMin === filters.minPrice && nextMax === filters.maxPrice) return;
    const timer = setTimeout(() => setFilters({ minPrice: nextMin, maxPrice: nextMax }), PRICE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [price, bounds.min, bounds.max, filters.minPrice, filters.maxPrice, setFilters]);

  const toggle = (key, value) => setFilters({ [key]: filters[key] === value ? "" : value });
  const toggleBrand = (brand) =>
    setFilters({
      brands: filters.brands.includes(brand) ? filters.brands.filter((b) => b !== brand) : [...filters.brands, brand],
    });

  const categories = facets?.categories ?? [];
  const sizes = facets?.sizes ?? [];
  const colors = facets?.colors ?? [];
  const brands = facets?.brands ?? [];

  return (
    <div className="offcanvas offcanvas-start canvas-filter" id="filterShop">
      <div className="canvas-wrapper">
        <div className="canvas-header">
          <h5>Filters</h5>
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="canvas-body">
          {categories.length > 0 && (
            <div className="widget-facet facet-categories">
              <h6 className="facet-title">Product Categories</h6>
              <ul className="facet-content">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`${pathname}?category=${encodeURIComponent(category.slug)}`}
                      className={`categories-item ${filters.category === category.slug ? "active" : ""}`}
                    >
                      {category.name} <span className="count-cate">({category.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="widget-facet facet-price">
            <h6 className="facet-title">Price</h6>
            <RangeSlider
              min={bounds.min}
              max={bounds.max}
              value={price}
              onInput={(value) => setPrice(value)}
              ariaLabel={["Minimum price", "Maximum price"]}
            />
            <div className="box-price-product mt-3">
              <div className="box-price-item">
                <span className="title-price">Min price</span>
                <div className="price-val" id="price-min-value">
                  {formatPrice(price[0])}
                </div>
              </div>
              <div className="box-price-item">
                <span className="title-price">Max price</span>
                <div className="price-val" id="price-max-value">
                  {formatPrice(price[1])}
                </div>
              </div>
            </div>
          </div>
          {sizes.length > 0 && (
            <div className="widget-facet facet-size">
              <h6 className="facet-title">Size</h6>
              <div className="facet-size-box size-box">
                {sizes.map((size) => (
                  <span
                    key={size.name}
                    role="button"
                    aria-pressed={filters.size === size.name}
                    onClick={() => toggle("size", size.name)}
                    className={`size-item size-check ${filters.size === size.name ? "active" : ""}`}
                  >
                    {size.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {colors.length > 0 && (
            <div className="widget-facet facet-color">
              <h6 className="facet-title">Colors</h6>
              <div className="facet-color-box">
                {colors.map((color) => {
                  const swatch = colorSwatch(color);
                  return (
                    <div
                      key={color.name}
                      role="button"
                      aria-pressed={filters.color === color.name}
                      onClick={() => toggle("color", color.name)}
                      className={`color-item color-check ${filters.color === color.name ? "active" : ""}`}
                    >
                      <span className={`color ${swatch.className}`} style={swatch.style} />
                      {color.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="widget-facet facet-fieldset">
            <h6 className="facet-title">Availability</h6>
            <div className="box-fieldset-item">
              {AVAILABILITY_OPTIONS.map((option) => (
                <fieldset
                  key={option.value}
                  className="fieldset-item"
                  onClick={() => toggle("availability", option.value)}
                >
                  <input
                    type="radio"
                    name="availability"
                    className="tf-check"
                    readOnly
                    checked={filters.availability === option.value}
                    aria-label={option.label}
                  />
                  <label>
                    {option.label}
                    {facets?.availability && (
                      <span className="count-stock">
                        {" "}
                        ({option.inStock ? facets.availability.inStock : facets.availability.outOfStock})
                      </span>
                    )}
                  </label>
                </fieldset>
              ))}
            </div>
          </div>
          {brands.length > 0 && (
            <div className="widget-facet facet-fieldset">
              <h6 className="facet-title">Brands</h6>
              <div className="box-fieldset-item">
                {brands.map((brand) => (
                  <fieldset key={brand.name} className="fieldset-item" onClick={() => toggleBrand(brand.name)}>
                    <input
                      type="checkbox"
                      name="brand"
                      className="tf-check"
                      readOnly
                      checked={filters.brands.includes(brand.name)}
                      aria-label={brand.name}
                    />
                    <label>
                      {brand.name} <span className="count-brand">({brand.count})</span>
                    </label>
                  </fieldset>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="canvas-bottom">
          <button id="reset-filter" type="button" onClick={clearFilters} className="tf-btn btn-reset">
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
