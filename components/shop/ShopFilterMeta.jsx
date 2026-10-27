"use client";
import React from "react";
import { AVAILABILITY_OPTIONS, hasActiveFilters } from "@/lib/shop/filters";
import { formatPrice } from "@/lib/format";
import { colorSwatch } from "./colorSwatch";

function Tag({ onRemove, children, className = "" }) {
  return (
    <span
      className={`filter-tag ${className}`}
      role="button"
      tabIndex={0}
      onClick={onRemove}
      onKeyDown={(event) => {
        if (event.key === "Enter") onRemove();
      }}
    >
      {children}
      <span className="remove-tag icon-close" />
    </span>
  );
}

/** "16 Products Found" + removable tags for each active filter (template markup). */
export default function ShopFilterMeta({ total, isLoading, filters, setFilters, clearFilters }) {
  const availability = AVAILABILITY_OPTIONS.find((option) => option.value === filters.availability);
  const hasPrice = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const colorDot = filters.color ? colorSwatch({ name: filters.color }) : null;

  return (
    <div className="meta-filter-shop">
      <div id="product-count-grid" className="count-text" aria-live="polite">
        <span className="count">{isLoading ? "…" : total}</span> Products Found
      </div>

      <div id="applied-filters">
        {availability && (
          <Tag onRemove={() => setFilters({ availability: "" })}>{availability.label}</Tag>
        )}
        {filters.size && <Tag onRemove={() => setFilters({ size: "" })}>{filters.size}</Tag>}
        {filters.color && (
          <Tag className="color-tag" onRemove={() => setFilters({ color: "" })}>
            <span className={`color ${colorDot.className}`} style={colorDot.style} />
            {filters.color}
          </Tag>
        )}
        {filters.brands.map((brand) => (
          <Tag key={brand} onRemove={() => setFilters({ brands: filters.brands.filter((b) => b !== brand) })}>
            {brand}
          </Tag>
        ))}
        {filters.onSale && <Tag onRemove={() => setFilters({ onSale: false })}>On sale</Tag>}
        {hasPrice && (
          <Tag onRemove={() => setFilters({ minPrice: undefined, maxPrice: undefined })}>
            {filters.minPrice !== undefined ? formatPrice(filters.minPrice) : "Any"} –{" "}
            {filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : "Any"}
          </Tag>
        )}
      </div>
      {hasActiveFilters(filters) && (
        <button
          id="remove-all"
          type="button"
          className="remove-all-filters text-btn-uppercase"
          onClick={clearFilters}
        >
          REMOVE ALL <i className="icon icon-close" />
        </button>
      )}
    </div>
  );
}
