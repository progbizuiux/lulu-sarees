import React from "react";

// The product's own description. The template's sample text ("Stretch strap top", fabric
// composition, "Designed in Barcelona", care icons) was removed: it wasn't about the product.
export default function Description({ product }) {
  if (!product) return null;
  return (
    <div className="right">
      <div className="letter-1 text-btn-uppercase mb_12">{product.title}</div>
      {product.description && (
        <p className="mb_12 text-secondary" style={{ whiteSpace: "pre-line" }}>
          {product.description}
        </p>
      )}
    </div>
  );
}
