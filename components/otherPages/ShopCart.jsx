"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useApplyCoupon,
  useAvailableCoupons,
  useCart,
  useRemoveCartItem,
  useRemoveCoupon,
  useUpdateCartItem,
  useClearCart,
} from "@/hooks/useCart";
import { EMPTY_CART } from "@/lib/mappers/cart.mapper";
import { config } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { confirmAction } from "@/lib/confirm";
import { notify } from "@/lib/notify";
import { FieldError, errorProps } from "@/components/auth/FormMessages";

// Every number on this page comes from the backend. The page only displays it.
export default function ShopCart() {
  const { data: cart = EMPTY_CART, isPending: isCartLoading } = useCart();
  const { data: coupons = [] } = useAvailableCoupons();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const { summary, freeShipping } = cart;
  const freeShippingProgress = freeShipping?.threshold
    ? Math.min(100, Math.round(((freeShipping.threshold - freeShipping.remaining) / freeShipping.threshold) * 100))
    : 0;
  const couponError = applyCoupon.error?.fieldErrors?.code ?? applyCoupon.error?.message;

  const setQuantity = (item, quantity) => {
    if (quantity < 1) return;
    if (item.maxQuantity && quantity > item.maxQuantity) return;
    updateItem.mutate({ itemId: item.id, quantity });
  };

  const isUpdating = (item) => updateItem.isPending && updateItem.variables?.itemId === item.id;

  const handleCoupon = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const code = String(new FormData(form).get("code") ?? "").trim();
    if (!code || applyCoupon.isPending) return;
    applyCoupon.mutate(code, { onSuccess: () => form.reset() });
  };

  return (
    <>
      <section className="flat-spacing">
        <div className="container">
          <div className="row">
            <div className="col-xl-8">
              <div className="tf-cart-sold">
                {freeShipping && cart.items.length > 0 && (
                  <div className="notification-progress">
                    <div className="text">
                      {freeShipping.remaining > 0 ? (
                        <>
                          Add{" "}
                          <span className="fw-semibold text-primary">
                            {formatPrice(freeShipping.remaining)}
                          </span>{" "}
                          more to get <span className="fw-semibold">free shipping</span>
                        </>
                      ) : (
                        <>
                          You've got <span className="fw-semibold">free shipping</span>!
                        </>
                      )}
                    </div>
                    <div className="progress-cart">
                      <div
                        className="value"
                        style={{ width: `${freeShippingProgress}%` }}
                        data-progress={freeShippingProgress}
                      >
                        <span className="round" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {isCartLoading ? (
                <div className="py-5 text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading your cart…</span>
                  </div>
                </div>
              ) : cart.items.length ? (
                <div>
                  <table className="tf-table-page-cart">
                    <thead>
                      <tr>
                        <th>Products</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item) => (
                        <tr key={item.id} className="tf-cart-item file-delete">
                          <td className="tf-cart-item_product">
                            <Link
                              href={`/product-detail/${item.productId}`}
                              className="img-box"
                            >
                              <Image
                                alt={item.title}
                                src={item.imgSrc}
                                width={600}
                                height={800}
                              />
                            </Link>
                            <div className="cart-info">
                              <Link
                                href={`/product-detail/${item.productId}`}
                                className="cart-title link"
                              >
                                {item.title}
                              </Link>
                              {item.variantName && (
                                <div className="text-secondary-2">{item.variantName}</div>
                              )}
                              {item.problem ? (
                                <div className="text-danger small">{item.problem}</div>
                              ) : (
                                !item.inStock && <div className="text-danger small">Out of stock</div>
                              )}
                            </div>
                          </td>
                          <td
                            data-cart-title="Price"
                            className="tf-cart-item_price text-center"
                          >
                            <div className="cart-price text-button price-on-sale">
                              {formatPrice(item.price)}
                            </div>
                          </td>
                          <td
                            data-cart-title="Quantity"
                            className="tf-cart-item_quantity"
                          >
                            <div className="wg-quantity mx-md-auto">
                              <span
                                className="btn-quantity btn-decrease"
                                role="button"
                                aria-label={`Decrease quantity of ${item.title}`}
                                aria-disabled={item.quantity <= 1}
                                onClick={() => setQuantity(item, item.quantity - 1)}
                              >
                                -
                              </span>
                              <input
                                type="text"
                                className="quantity-product"
                                name="number"
                                value={item.quantity}
                                aria-label={`Quantity of ${item.title}`}
                                readOnly
                              />
                              <span
                                className="btn-quantity btn-increase"
                                role="button"
                                aria-label={`Increase quantity of ${item.title}`}
                                aria-disabled={Boolean(item.maxQuantity) && item.quantity >= item.maxQuantity}
                                onClick={() => setQuantity(item, item.quantity + 1)}
                              >
                                +
                              </span>
                            </div>
                          </td>
                          <td
                            data-cart-title="Total"
                            className="tf-cart-item_total text-center"
                          >
                            {/* Faded while the backend recalculates this line. */}
                            <div
                              className="cart-total text-button total-price"
                              style={{ opacity: isUpdating(item) ? 0.5 : 1 }}
                            >
                              {formatPrice(item.lineTotal)}
                            </div>
                          </td>
                          <td
                            data-cart-title="Remove"
                            className="remove-cart"
                            role="button"
                            aria-label={`Remove ${item.title}`}
                            onClick={() => removeItem.mutate(item.id)}
                          >
                            <span className="remove icon icon-close" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="tf-cart-clear">
                    <button
                      type="button"
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
                  {/* Coupons: demo data only until the ERP has them (config.features.coupons) */}
                  {config.features.coupons && (
                  <form className="ip-discount-code" onSubmit={handleCoupon} noValidate>
                    <input
                      type="text"
                      name="code"
                      placeholder="Add voucher discount"
                      autoComplete="off"
                      aria-label="Coupon code"
                      {...errorProps("cart-coupon-error", couponError)}
                    />
                    <button className="tf-btn" type="submit" disabled={applyCoupon.isPending}>
                      <span className="text">{applyCoupon.isPending ? "Applying…" : "Apply Code"}</span>
                    </button>
                  </form>
                  )}
                  <FieldError id="cart-coupon-error" message={couponError} />
                  {cart.coupon && (
                    <p className="text-button mt-2">
                      Coupon <strong>{cart.coupon.code}</strong> applied.{" "}
                      <button
                        type="button"
                        className="lulu-link-button"
                        onClick={() => removeCoupon.mutate()}
                        disabled={removeCoupon.isPending}
                      >
                        Remove
                      </button>
                    </p>
                  )}
                  {coupons.length > 0 && (
                    <div className="group-discount">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.code}
                          className={`box-discount ${
                            cart.coupon?.code === coupon.code ? "active" : ""
                          }`}
                        >
                          <div className="discount-top">
                            <div className="discount-off">
                              <div className="text-caption-1">Discount</div>
                              <span className="sale-off text-btn-uppercase">
                                {coupon.title}
                              </span>
                            </div>
                            <div className="discount-from">
                              <p className="text-caption-1">{coupon.description}</p>
                            </div>
                          </div>
                          <div className="discount-bot">
                            <span className="text-btn-uppercase">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              className="tf-btn"
                              onClick={() => applyCoupon.mutate(coupon.code)}
                              disabled={applyCoupon.isPending || cart.coupon?.code === coupon.code}
                            >
                              <span className="text">
                                {cart.coupon?.code === coupon.code ? "Applied" : "Apply Code"}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  Your cart is empty. Start adding your favorite products to
                  it!{" "}
                  <Link className="btn-line" href="/shop-default-grid">
                    Explore Products
                  </Link>
                </div>
              )}
            </div>
            <div className="col-xl-4">
              <div className="fl-sidebar-cart">
                <div className="box-order bg-surface">
                  <h5 className="title">Order Summary</h5>
                  <div className="subtotal text-button d-flex justify-content-between align-items-center">
                    <span>Subtotal</span>
                    <span className="total">{formatPrice(summary.subtotal)}</span>
                  </div>
                  <div className="discount text-button d-flex justify-content-between align-items-center">
                    <span>Discounts</span>
                    <span className="total">
                      {summary.discount > 0 ? `−${formatPrice(summary.discount)}` : formatPrice(0)}
                    </span>
                  </div>
                  <div className="discount text-button d-flex justify-content-between align-items-center">
                    <span>Shipping</span>
                    <span className="total">
                      {cart.items.length && summary.shipping === 0 ? "Free" : formatPrice(summary.shipping)}
                    </span>
                  </div>
                  <h5 className="total-order d-flex justify-content-between align-items-center">
                    <span>Total</span>
                    <span className="total">{formatPrice(summary.total)}</span>
                  </h5>
                  <div className="box-progress-checkout">
                    <Link href={`/checkout`} className="tf-btn btn-reset">
                      Proceed to checkout
                    </Link>
                    <Link href="/shop-default-grid" className="text-button text-center d-block">
                      Or continue shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
