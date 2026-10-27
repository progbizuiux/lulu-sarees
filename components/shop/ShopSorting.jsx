"use client";
import { SORT_OPTIONS } from "@/lib/shop/filters";

/** Sort dropdown (template markup). The backend does the sorting. */
export default function ShopSorting({ value, onChange }) {
  const current = SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0];

  return (
    <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
      <div className="btn-select">
        <span className="text-sort-value">{current.label}</span>
        <span className="icon icon-arrow-down" />
      </div>
      <div className="dropdown-menu">
        {SORT_OPTIONS.map((option) => (
          <div
            key={option.value || "default"}
            role="option"
            aria-selected={option.value === current.value}
            onClick={() => onChange(option.value)}
            className={`select-item ${option.value === current.value ? "active" : ""}`}
          >
            <span className="text-value-item">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
