"use client";
export default function QuantitySelect({
  quantity = 1,
  setQuantity = () => {},
  styleClass = "",
  max = 10, // same as the cart's limit per item
}) {
  return (
    <>
      <div className={`wg-quantity ${styleClass} `}>
        <span
          className="btn-quantity btn-decrease"
          onClick={() => setQuantity(quantity > 1 ? quantity - 1 : quantity)}
          role="button"
          tabIndex={0}
        >
          -
        </span>
        <input
          className="quantity-product"
          type="number"
          name="number"
          min={1}
          max={max}
          value={quantity}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value > 0) {
              setQuantity(Math.min(value, max));
            }
          }}
        />
        <span
          className="btn-quantity btn-increase"
          onClick={() => setQuantity(Math.min(quantity + 1, max))}
          role="button"
          tabIndex={0}
        >
          +
        </span>
      </div>
    </>
  );
}
