"use client";
import React from "react";
import { useContextElement } from "@/context/Context";

const sameId = (a, b) => String(a) === String(b);

/**
 * Wrap an "Add to cart" button with this. Until the product is in the cart the button shows as
 * usual; after that a "− quantity +" control takes its place:
 *   − takes one off (at 1 it removes the item, and the button comes back), + adds one more.
 * The control borrows the button's classes, so it keeps the button's size, colours and position.
 *
 * @example
 * <CartControl productId={product.id}>
 *   <button className="xc__cta" onClick={() => addProductToCart(product.id)}>Add to cart</button>
 * </CartControl>
 */
export default function CartControl({ productId, children }) {
  const { cartProducts, updateQuantity } = useContextElement();
  const line = cartProducts.find((item) => sameId(item.id, productId));
  if (!line) return children;

  const buttonClass = React.isValidElement(children) ? children.props.className ?? "" : "";
  const atMax = Boolean(line.maxQuantity) && line.quantity >= line.maxQuantity;
  const change = (event, quantity) => {
    // the control can sit inside a product link or card that reacts to clicks
    event.preventDefault();
    event.stopPropagation();
    updateQuantity(productId, quantity);
  };

  return (
    <div className={`${buttonClass} cart-stepper`} role="group" aria-label="Quantity in cart">
      <button
        type="button"
        className="cart-stepper__btn"
        aria-label={line.quantity > 1 ? "Remove one" : "Remove from cart"}
        onClick={(event) => change(event, line.quantity - 1)}
      >
        −
      </button>
      <span className="cart-stepper__qty" aria-live="polite">
        {line.quantity}
      </span>
      <button
        type="button"
        className="cart-stepper__btn"
        aria-label="Add one more"
        disabled={atMax}
        onClick={(event) => change(event, line.quantity + 1)}
      >
        +
      </button>
    </div>
  );
}
