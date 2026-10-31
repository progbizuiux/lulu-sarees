"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { useSuggestedProducts } from "@/hooks/useProducts";
import { config } from "@/lib/config";
import {
  useApplyCoupon,
  useCart,
  useRemoveCartItem,
  useRemoveCoupon,
  useUpdateCartItem,
  useClearCart,
} from "@/hooks/useCart";
import { usePincodeCheck } from "@/hooks/useCheckout";
import { EMPTY_CART } from "@/lib/mappers/cart.mapper";
import { formatDate, formatPrice } from "@/lib/format";
import { confirmAction } from "@/lib/confirm";
import { notify } from "@/lib/notify";
import { FieldError, errorProps } from "@/components/auth/FormMessages";
import CartControl from "@/components/common/CartControl";

// The drawer's order note is kept for this browser tab; checkout pre-fills its "Order note" from it.
const ORDER_NOTE_KEY = "lulu-order-note";
const NOTE_MAX_LENGTH = 500; // same limit as the checkout's order note

function readOrderNote() {
  try {
    return sessionStorage.getItem(ORDER_NOTE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveOrderNote(text) {
  try {
    if (text) sessionStorage.setItem(ORDER_NOTE_KEY, text);
    else sessionStorage.removeItem(ORDER_NOTE_KEY);
  } catch {
    // storage blocked (e.g. private mode): the note can still be typed at checkout
  }
}

export default function CartModal() {
  const { addProductToCart } = useContextElement();
  const { data: cart = EMPTY_CART, isPending: isCartLoading } = useCart();
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const [currentOpenPopup, setCurrentOpenPopup] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincode, setPincode] = useState(""); // the pincode being checked
  const [pincodeError, setPincodeError] = useState("");
  const pincodeCheck = usePincodeCheck(pincode);
  const pincodeCheckError = pincodeCheck.isError
    ? pincodeCheck.error?.fieldErrors?.pincode ?? "We couldn't check delivery right now."
    : "";

  // Suggestions: the latest products (demo products in mock mode), minus what's already in the cart.
  const { data: suggestedProducts = [] } = useSuggestedProducts(12);
  const inCart = new Set(cart.items.map((item) => String(item.productId)));
  const suggestions = suggestedProducts.filter((product) => !inCart.has(String(product.id))).slice(0, 4);

  const { summary, freeShipping } = cart;
  const freeShippingProgress = freeShipping?.threshold
    ? Math.min(100, Math.round(((freeShipping.threshold - freeShipping.remaining) / freeShipping.threshold) * 100))
    : 0;
  const couponError = applyCoupon.error?.fieldErrors?.code ?? applyCoupon.error?.message;

  const handleCoupon = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const code = String(new FormData(form).get("code") ?? "").trim();
    if (!code || applyCoupon.isPending) return;
    applyCoupon.mutate(code, {
      onSuccess: () => {
        form.reset();
        setCurrentOpenPopup("");
      },
    });
  };

  // Same limits as the cart page: at least 1 (use "Remove" to take it out), at most maxQuantity.
  const setQuantity = (item, quantity) => {
    if (quantity < 1) return;
    if (item.maxQuantity && quantity > item.maxQuantity) return;
    updateItem.mutate({ itemId: item.id, quantity });
  };

  const closePopup = () => {
    setCurrentOpenPopup("");
    applyCoupon.reset();
  };

  // Open the note with what was saved before.
  const openNote = () => {
    setNoteDraft(readOrderNote());
    setCurrentOpenPopup("add-note");
  };

  const handleSaveNote = (event) => {
    event.preventDefault();
    saveOrderNote(noteDraft.trim());
    setCurrentOpenPopup("");
  };

  // Indian pincodes are 6 digits and don't start with 0.
  const handlePincode = (event) => {
    event.preventDefault();
    const value = pincodeInput.trim();
    if (!/^[1-9]\d{5}$/.test(value)) {
      setPincodeError("Enter a valid 6-digit pincode.");
      setPincode("");
      return;
    }
    setPincodeError("");
    setPincode(value);
  };

  return (
    <div className="modal fullRight fade modal-shopping-cart" id="shoppingCart">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="tf-minicart-recommendations">
            <h6 className="title">You May Also Like</h6>
            <div className="wrap-recommendations">
              <div className="list-cart">
                {suggestions.map((product) => (
                  <div className="list-cart-item" key={product.id}>
                    <div className="image">
                      <Image
                        className="lazyload"
                        data-src={product.imgSrc}
                        alt={product.title}
                        src={product.imgSrc}
                        width={600}
                        height={800}
                      />
                    </div>
                    <div className="content">
                      <div className="name">
                        <Link
                          className="link text-line-clamp-1"
                          href={`/product-detail/${product.id}`}
                        >
                          {product.title}
                        </Link>
                      </div>
                      <div className="cart-item-bot">
                        <div className="text-button price">
                          {formatPrice(product.price)}
                        </div>
                        <CartControl productId={product.id}>
                          <a
                            className="link text-button"
                            onClick={() => addProductToCart(product.id, 1, false)}
                          >
                            {"Add to cart"}
                          </a>
                        </CartControl>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="d-flex flex-column flex-grow-1 h-100">
            <div className="header">
              <h5 className="title">Shopping Cart</h5>
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="wrap">
              {freeShipping && cart.items.length > 0 && (
                <div className="tf-mini-cart-threshold">
                  <div className="tf-progress-bar">
                    <div
                      className="value"
                      style={{ width: `${freeShippingProgress}%` }}
                      data-progress={freeShippingProgress}
                    >
                      <i className="icon icon-shipping" />
                    </div>
                  </div>
                  <div className="text-caption-1">
                    {freeShipping.remaining > 0 ? (
                      <>
                        Add <span className="fw-semibold">{formatPrice(freeShipping.remaining)}</span> more
                        to get free shipping
                      </>
                    ) : (
                      "Congratulations! You've got free shipping!"
                    )}
                  </div>
                </div>
              )}
              <div className="tf-mini-cart-wrap">
                <div className="tf-mini-cart-main">
                  <div className="tf-mini-cart-sroll">
                    {isCartLoading ? (
                      <div className="p-4 text-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading your cart…</span>
                        </div>
                      </div>
                    ) : cart.items.length ? (
                      <div className="tf-mini-cart-items">
                        {cart.items.map((item) => (
                          <div
                            key={item.id}
                            className="tf-mini-cart-item file-delete"
                          >
                            <div className="tf-mini-cart-image">
                              <Image
                                className="lazyload"
                                alt={item.title}
                                src={item.imgSrc}
                                width={600}
                                height={800}
                              />
                            </div>
                            <div className="tf-mini-cart-info flex-grow-1">
                              <div className="mb_12 d-flex align-items-center justify-content-between flex-wrap gap-12">
                                <div className="text-title">
                                  <Link
                                    href={`/product-detail/${item.productId}`}
                                    className="link text-line-clamp-1"
                                  >
                                    {item.title}
                                  </Link>
                                </div>
                                <div
                                  className="text-button tf-btn-remove remove"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => removeItem.mutate(item.id)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") removeItem.mutate(item.id);
                                  }}
                                >
                                  Remove
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-between flex-wrap gap-12">
                                <div className="d-flex align-items-center flex-wrap gap-12">
                                  {item.variantName && (
                                    <div className="text-secondary-2">{item.variantName}</div>
                                  )}
                                  {item.problem && <div className="text-danger small">{item.problem}</div>}
                                  <div className="wg-quantity">
                                    <span
                                      className="btn-quantity btn-decrease"
                                      role="button"
                                      tabIndex={0}
                                      aria-label={`Decrease quantity of ${item.title}`}
                                      aria-disabled={item.quantity <= 1}
                                      onClick={() => setQuantity(item, item.quantity - 1)}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter") setQuantity(item, item.quantity - 1);
                                      }}
                                    >
                                      -
                                    </span>
                                    <input
                                      type="text"
                                      className="quantity-product"
                                      value={item.quantity}
                                      aria-label={`Quantity of ${item.title}`}
                                      readOnly
                                    />
                                    <span
                                      className="btn-quantity btn-increase"
                                      role="button"
                                      tabIndex={0}
                                      aria-label={`Increase quantity of ${item.title}`}
                                      aria-disabled={Boolean(item.maxQuantity) && item.quantity >= item.maxQuantity}
                                      onClick={() => setQuantity(item, item.quantity + 1)}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter") setQuantity(item, item.quantity + 1);
                                      }}
                                    >
                                      +
                                    </span>
                                  </div>
                                </div>
                                <div className="text-button">
                                  {item.quantity} X {formatPrice(item.price)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="tf-mini-cart-clear">
                          <button
                            type="button"
                            className="text-button tf-btn-remove"
                            onClick={async () => {
                              const confirmed = await confirmAction({
                                title: "Clear your cart?",
                                message: "All items will be removed from your cart.",
                                confirmLabel: "Clear cart",
                              });
                              if (confirmed) {
                                clearCart.mutate(undefined, {
                                  onSuccess: () => notify("Your cart is now empty.", { type: "success" }),
                                });
                              }
                            }}
                          >
                            Clear cart
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        Your Cart is empty. Start adding favorite products to
                        cart!{" "}
                        <Link className="btn-line" href="/shop-default-grid">
                          Explore Products
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <div className="tf-mini-cart-bottom">
                  {/* Note, Shipping and Coupon: demo data only until the ERP has them (config.features) */}
                  <div className="tf-mini-cart-tool">
                    {config.features.orderNote && (
                    <div
                      className="tf-mini-cart-tool-btn btn-add-note"
                      onClick={openNote}
                    >
                      <svg
                        width={21}
                        height={20}
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_6133_36620)">
                          <path
                            d="M10 3.33325H4.16667C3.72464 3.33325 3.30072 3.50885 2.98816 3.82141C2.67559 4.13397 2.5 4.55789 2.5 4.99992V16.6666C2.5 17.1086 2.67559 17.5325 2.98816 17.8451C3.30072 18.1577 3.72464 18.3333 4.16667 18.3333H15.8333C16.2754 18.3333 16.6993 18.1577 17.0118 17.8451C17.3244 17.5325 17.5 17.1086 17.5 16.6666V10.8333"
                            stroke="#181818"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16.25 2.0832C16.5815 1.75168 17.0312 1.56543 17.5 1.56543C17.9688 1.56543 18.4185 1.75168 18.75 2.0832C19.0815 2.41472 19.2678 2.86436 19.2678 3.3332C19.2678 3.80204 19.0815 4.25168 18.75 4.5832L10.8333 12.4999L7.5 13.3332L8.33333 9.99986L16.25 2.0832Z"
                            stroke="#181818"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_6133_36620">
                            <rect
                              width={20}
                              height={20}
                              fill="white"
                              transform="translate(0.833008)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="text-caption-1">Note</div>
                    </div>
                    )}
                    {config.features.pincodeCheck && (
                    <div
                      className="tf-mini-cart-tool-btn btn-estimate-shipping"
                      onClick={() => setCurrentOpenPopup("estimate-shipping")}
                    >
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.333 2.5H0.833008V13.3333H13.333V2.5Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.333 6.66675H16.6663L19.1663 9.16675V13.3334H13.333V6.66675Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4.58333 17.4999C5.73393 17.4999 6.66667 16.5672 6.66667 15.4166C6.66667 14.266 5.73393 13.3333 4.58333 13.3333C3.43274 13.3333 2.5 14.266 2.5 15.4166C2.5 16.5672 3.43274 17.4999 4.58333 17.4999Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.4163 17.4999C16.5669 17.4999 17.4997 16.5672 17.4997 15.4166C17.4997 14.266 16.5669 13.3333 15.4163 13.3333C14.2657 13.3333 13.333 14.266 13.333 15.4166C13.333 16.5672 14.2657 17.4999 15.4163 17.4999Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-caption-1">Shipping</div>
                    </div>
                    )}
                    {config.features.coupons && (
                    <div
                      className="tf-mini-cart-tool-btn btn-add-coupon"
                      onClick={() => setCurrentOpenPopup("add-coupon")}
                    >
                      <svg
                        width={21}
                        height={20}
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.3247 11.1751L11.3497 17.1501C11.1949 17.305 11.0111 17.428 10.8087 17.5118C10.6064 17.5957 10.3895 17.6389 10.1705 17.6389C9.95148 17.6389 9.7346 17.5957 9.53227 17.5118C9.32994 17.428 9.14613 17.305 8.99134 17.1501L1.83301 10.0001V1.66675H10.1663L17.3247 8.82508C17.6351 9.13735 17.8093 9.55977 17.8093 10.0001C17.8093 10.4404 17.6351 10.8628 17.3247 11.1751V11.1751Z"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.99902 5.83325H6.00902"
                          stroke="#181818"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-caption-1">Coupon</div>
                    </div>
                    )}
                  </div>
                  <div className="tf-mini-cart-bottom-wrap">
                    {cart.coupon && (
                      <div className="tf-cart-totals-discounts mb_8">
                        <span className="text-button">
                          Coupon {cart.coupon.code}{" "}
                          <button
                            type="button"
                            className="lulu-link-button text-secondary-2"
                            onClick={() => removeCoupon.mutate()}
                            disabled={removeCoupon.isPending}
                          >
                            Remove
                          </button>
                        </span>
                        <span className="text-button">−{formatPrice(summary.discount)}</span>
                      </div>
                    )}
                    <div className="tf-cart-totals-discounts">
                      <h5>Subtotal</h5>
                      <h5 className="tf-totals-total-value">
                        {formatPrice(summary.subtotal)}
                      </h5>
                    </div>
                    <div className="tf-mini-cart-view-checkout">
                      <Link
                        href={`/shopping-cart`}
                        className="tf-btn w-100 btn-white radius-4 has-border"
                      >
                        <span className="text">View cart</span>
                      </Link>
                      <Link
                        href={`/checkout`}
                        className="tf-btn w-100 btn-fill radius-4"
                      >
                        <span className="text">Check Out</span>
                      </Link>
                    </div>
                    <div className="text-center">
                      <Link
                        className="link text-btn-uppercase"
                        href={`/shop-default-grid`}
                      >
                        Or continue shopping
                      </Link>
                    </div>
                  </div>
                </div>
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "add-note" ? "open" : ""
                  }`}
                >
                  <div className="tf-mini-cart-tool-content">
                    <label
                      htmlFor="Cart-note"
                      className="tf-mini-cart-tool-text"
                    >
                      <span className="icon">
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_6766_32777)">
                            <path
                              d="M9.16699 3.33325H3.33366C2.89163 3.33325 2.46771 3.50885 2.15515 3.82141C1.84259 4.13397 1.66699 4.55789 1.66699 4.99992V16.6666C1.66699 17.1086 1.84259 17.5325 2.15515 17.8451C2.46771 18.1577 2.89163 18.3333 3.33366 18.3333H15.0003C15.4424 18.3333 15.8663 18.1577 16.1788 17.8451C16.4914 17.5325 16.667 17.1086 16.667 16.6666V10.8333"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15.417 2.0832C15.7485 1.75168 16.1981 1.56543 16.667 1.56543C17.1358 1.56543 17.5855 1.75168 17.917 2.0832C18.2485 2.41472 18.4348 2.86436 18.4348 3.3332C18.4348 3.80204 18.2485 4.25168 17.917 4.5832L10.0003 12.4999L6.66699 13.3332L7.50033 9.99986L15.417 2.0832Z"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_6766_32777">
                              <rect width={20} height={20} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                      <span className="text-title">Note</span>
                    </label>
                    <form
                      className="form-add-note tf-mini-cart-tool-wrap"
                      onSubmit={handleSaveNote}
                    >
                      <fieldset className="d-flex">
                        <textarea
                          name="note"
                          id="Cart-note"
                          placeholder="Add special instructions for your order..."
                          value={noteDraft}
                          maxLength={NOTE_MAX_LENGTH}
                          onChange={(event) => setNoteDraft(event.target.value)}
                        />
                      </fieldset>
                      <div className="tf-cart-tool-btns">
                        <button type="submit" className="btn-style-2 w-100">
                          <span className="text text-btn-uppercase">Save</span>
                        </button>
                        <div
                          className="text-center w-100 text-btn-uppercase tf-mini-cart-tool-close"
                          onClick={() => setCurrentOpenPopup("")}
                        >
                          Cancel
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "estimate-shipping" ? "open" : ""
                  } `}
                >
                  <div className="tf-mini-cart-tool-content">
                    <label className="tf-mini-cart-tool-text">
                      <span className="icon">
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_6766_32777)">
                            <path
                              d="M9.16699 3.33325H3.33366C2.89163 3.33325 2.46771 3.50885 2.15515 3.82141C1.84259 4.13397 1.66699 4.55789 1.66699 4.99992V16.6666C1.66699 17.1086 1.84259 17.5325 2.15515 17.8451C2.46771 18.1577 2.89163 18.3333 3.33366 18.3333H15.0003C15.4424 18.3333 15.8663 18.1577 16.1788 17.8451C16.4914 17.5325 16.667 17.1086 16.667 16.6666V10.8333"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15.417 2.0832C15.7485 1.75168 16.1981 1.56543 16.667 1.56543C17.1358 1.56543 17.5855 1.75168 17.917 2.0832C18.2485 2.41472 18.4348 2.86436 18.4348 3.3332C18.4348 3.80204 18.2485 4.25168 17.917 4.5832L10.0003 12.4999L6.66699 13.3332L7.50033 9.99986L15.417 2.0832Z"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_6766_32777">
                              <rect width={20} height={20} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                      <span className="text-title">
                        Check delivery to your pincode
                      </span>
                    </label>
                    <form
                      className="form-estimate-shipping tf-mini-cart-tool-wrap"
                      onSubmit={handlePincode}
                      noValidate
                    >
                      <fieldset className="">
                        <div className="text-caption-1 text-secondary mb_8">
                          Pincode
                        </div>
                        <input
                          className=""
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="6-digit pincode"
                          name="pincode"
                          maxLength={6}
                          tabIndex={2}
                          value={pincodeInput}
                          onChange={(event) => {
                            // digits only; a new pincode clears the old result
                            setPincodeInput(event.target.value.replace(/\D/g, ""));
                            setPincodeError("");
                            setPincode("");
                          }}
                          aria-label="Pincode"
                          aria-required="true"
                          required
                          {...errorProps("drawer-pincode-error", pincodeError || pincodeCheckError)}
                        />
                        <FieldError
                          id="drawer-pincode-error"
                          message={pincodeError || pincodeCheckError}
                        />
                      </fieldset>
                      {/* Same answer the checkout gives: delivery, expected date, Cash on Delivery. */}
                      {pincode && !pincodeCheck.isError && (
                        <div className="text-caption-1 mt_12" role="status">
                          {pincodeCheck.isPending ? (
                            <p className="mb-0 text-secondary">
                              Checking delivery to {pincode}…
                            </p>
                          ) : pincodeCheck.data.serviceable ? (
                            <>
                              <p className="mb-0 text-success">
                                ✓ We deliver to {pincode}
                                {pincodeCheck.data.estimatedDelivery && (
                                  <> · Expected by {formatDate(pincodeCheck.data.estimatedDelivery)}</>
                                )}
                              </p>
                              <p className="mb-0 text-secondary">
                                {pincodeCheck.data.codAvailable
                                  ? "Cash on Delivery is available."
                                  : "Cash on Delivery isn't available for this pincode."}
                              </p>
                            </>
                          ) : (
                            <p className="mb-0 text-danger">
                              Sorry, we don&apos;t deliver to pincode {pincode} yet.
                            </p>
                          )}
                        </div>
                      )}
                      <div className="tf-cart-tool-btns">
                        <button
                          type="submit"
                          className="btn-style-2 w-100"
                          disabled={pincodeCheck.isFetching}
                          aria-busy={pincodeCheck.isFetching}
                        >
                          <span className="text text-btn-uppercase">
                            {pincodeCheck.isFetching ? "Checking…" : "Check"}
                          </span>
                        </button>
                        <div
                          className="text-center w-100 text-btn-uppercase tf-mini-cart-tool-close"
                          onClick={() => setCurrentOpenPopup("")}
                        >
                          Cancel
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div
                  className={`tf-mini-cart-tool-openable ${
                    currentOpenPopup == "add-coupon" ? "open" : ""
                  } `}
                >
                  <div className="tf-mini-cart-tool-content">
                    <label className="tf-mini-cart-tool-text">
                      <span className="icon">
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_6766_32777)">
                            <path
                              d="M9.16699 3.33325H3.33366C2.89163 3.33325 2.46771 3.50885 2.15515 3.82141C1.84259 4.13397 1.66699 4.55789 1.66699 4.99992V16.6666C1.66699 17.1086 1.84259 17.5325 2.15515 17.8451C2.46771 18.1577 2.89163 18.3333 3.33366 18.3333H15.0003C15.4424 18.3333 15.8663 18.1577 16.1788 17.8451C16.4914 17.5325 16.667 17.1086 16.667 16.6666V10.8333"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15.417 2.0832C15.7485 1.75168 16.1981 1.56543 16.667 1.56543C17.1358 1.56543 17.5855 1.75168 17.917 2.0832C18.2485 2.41472 18.4348 2.86436 18.4348 3.3332C18.4348 3.80204 18.2485 4.25168 17.917 4.5832L10.0003 12.4999L6.66699 13.3332L7.50033 9.99986L15.417 2.0832Z"
                              stroke="#181818"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_6766_32777">
                              <rect width={20} height={20} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                      <span className="text-title">Add A Coupon Code</span>
                    </label>
                    <form
                      className="form-add-coupon tf-mini-cart-tool-wrap"
                      onSubmit={handleCoupon}
                      noValidate
                    >
                      <fieldset className="">
                        <div className="text-caption-1 text-secondary mb_8">
                          Enter Code
                        </div>
                        <input
                          className=""
                          type="text"
                          placeholder="Discount code"
                          name="code"
                          autoComplete="off"
                          tabIndex={2}
                          defaultValue=""
                          aria-required="true"
                          required
                          {...errorProps("drawer-coupon-error", couponError)}
                        />
                        <FieldError id="drawer-coupon-error" message={couponError} />
                      </fieldset>
                      <div className="tf-cart-tool-btns">
                        <button
                          type="submit"
                          className="btn-style-2 w-100"
                          disabled={applyCoupon.isPending}
                          aria-busy={applyCoupon.isPending}
                        >
                          <span className="text text-btn-uppercase">
                            {applyCoupon.isPending ? "Applying…" : "Apply"}
                          </span>
                        </button>
                        <div
                          className="text-center w-100 text-btn-uppercase tf-mini-cart-tool-close"
                          onClick={closePopup}
                        >
                          Cancel
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
