"use client";

import { useId, useState } from "react";

const sizes = [
  { id: "values-s", value: "S", price: 79.99, disabled: false },
  { id: "values-m", value: "M", price: 79.99, disabled: false },
  { id: "values-l", value: "L", price: 89.99, disabled: false },
  { id: "values-xl", value: "XL", price: 89.99, disabled: false },
  { id: "values-xxl", value: "XXL", price: 89.99, disabled: true },
];

// With `variants` (the product's own options: [{ id, name, price, inStock }]) the picker shows those,
// and `onSelect(variantId)` reports the choice. Without them it shows the template's demo sizes
// (still used by the template's other product page layouts).
export default function SizeSelect({ variants, selectedId, onSelect = () => {} }) {
  const [selectedSize, setSelectedSize] = useState("L"); // Default value is "L"
  const uid = useId(); // unique radio ids, as the page and the quick view popup can both show a picker

  const options = variants
    ? variants.map((variant) => ({
        id: `${uid}-${variant.id}`,
        key: variant.id,
        value: variant.name,
        price: variant.price,
        disabled: !variant.inStock,
      }))
    : sizes.map((size) => ({ ...size, key: size.value }));
  const selected = variants
    ? variants.find((variant) => String(variant.id) === String(selectedId))?.name
    : selectedSize;

  const handleChange = (option) => {
    if (option.disabled) return; // out of stock
    if (variants) onSelect(option.key);
    else setSelectedSize(option.value);
  };
  return (
    <div className="variant-picker-item">
      <div className="d-flex justify-content-between mb_12">
        <div className="variant-picker-label">
          {variants ? "Option:" : "selected size:"}
          <span className="text-title variant-picker-label-value">
            {selected}
          </span>
        </div>
        <a
          href="#size-guide"
          data-bs-toggle="modal"
          className="size-guide text-title link"
        >
          Size Guide
        </a>
      </div>
      <div className="variant-picker-values gap12">
        {options.map((option) => (
          <div key={option.key} onClick={() => handleChange(option)}>
            <input
              type="radio"
              id={option.id}
              checked={variants ? String(option.key) === String(selectedId) : selectedSize === option.value}
              disabled={option.disabled}
              readOnly
            />
            <label
              className={`style-text size-btn ${
                option.disabled ? "type-disable" : ""
              }`}
              htmlFor={option.id}
              data-value={option.value}
              data-price={option.price}
            >
              <span className="text-title">{option.value}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
