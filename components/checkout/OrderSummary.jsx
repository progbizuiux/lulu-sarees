"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "@/components/common/SwiperSSR";
import { useApplyCoupon, useAvailableCoupons, useRemoveCoupon } from "@/hooks/useCart";
import { formatPrice } from "@/lib/format";
import { FieldError, errorProps } from "@/components/auth/FormMessages";

/**
 * Right column of checkout (template markup): items, coupons and the backend's final totals.
 * Totals come from the checkout summary, which already includes the coupon, shipping and COD fee.
 */
export default function OrderSummary({ cart, summaryQuery, disabled }) {
  const { data: coupons = [] } = useAvailableCoupons();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const items = summaryQuery.data?.items ?? cart.items;
  const totals = summaryQuery.data?.summary;
  const messages = summaryQuery.data?.messages ?? [];
  const isRefreshing = summaryQuery.isFetching;
  const couponError = applyCoupon.error?.fieldErrors?.code ?? applyCoupon.error?.message;

  const handleCoupon = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const code = String(new FormData(form).get("code") ?? "").trim();
    if (!code || applyCoupon.isPending || disabled) return;
    applyCoupon.mutate(code, { onSuccess: () => form.reset() });
  };

  return (
    <div className="flat-spacing flat-sidebar-checkout">
      <div className="sidebar-checkout-content">
        <h5 className="title">Order summary</h5>
        <div className="list-product">
          {items.map((item) => (
            <div key={item.id} className="item-product">
              <Link href={`/product-detail/${item.productId}`} className="img-product">
                <Image alt={item.title} src={item.imgSrc} width={600} height={800} />
              </Link>
              <div className="content-box">
                <div className="info">
                  <Link href={`/product-detail/${item.productId}`} className="name-product link text-title">
                    {item.title}
                  </Link>
                  {item.variantName && (
                    <div className="variant text-caption-1 text-secondary">{item.variantName}</div>
                  )}
                </div>
                <div className="total-price text-button">
                  <span className="count">{item.quantity}</span>X
                  <span className="price">{formatPrice(item.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="sec-discount">
          {coupons.length > 0 && (
            <Swiper
              dir="ltr"
              className="swiper tf-sw-categories"
              slidesPerView={2.25}
              breakpoints={{ 1024: { slidesPerView: 2.25 }, 768: { slidesPerView: 3 }, 640: { slidesPerView: 2.5 }, 0: { slidesPerView: 1.2 } }}
              spaceBetween={20}
            >
              {coupons.map((coupon) => {
                const isApplied = cart.coupon?.code === coupon.code;
                return (
                  <SwiperSlide key={coupon.code}>
                    <div className={`box-discount ${isApplied ? "active" : ""}`}>
                      <div className="discount-top">
                        <div className="discount-off">
                          <div className="text-caption-1">Discount</div>
                          <span className="sale-off text-btn-uppercase">{coupon.title}</span>
                        </div>
                        <div className="discount-from">
                          <p className="text-caption-1">{coupon.description}</p>
                        </div>
                      </div>
                      <div className="discount-bot">
                        <span className="text-btn-uppercase">{coupon.code}</span>
                        <button
                          type="button"
                          className="tf-btn"
                          onClick={() => applyCoupon.mutate(coupon.code)}
                          disabled={disabled || applyCoupon.isPending || isApplied}
                        >
                          <span className="text">{isApplied ? "Applied" : "Apply Code"}</span>
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
          <form className="ip-discount-code" onSubmit={handleCoupon} noValidate>
            <input
              type="text"
              name="code"
              placeholder="Add voucher discount"
              autoComplete="off"
              aria-label="Coupon code"
              disabled={disabled}
              {...errorProps("checkout-coupon-error", couponError)}
            />
            <button className="tf-btn" type="submit" disabled={disabled || applyCoupon.isPending}>
              <span className="text">{applyCoupon.isPending ? "Applying…" : "Apply Code"}</span>
            </button>
          </form>
          <FieldError id="checkout-coupon-error" message={couponError} />
          {cart.coupon && (
            <p className="text-button mt-2">
              Coupon <strong>{cart.coupon.code}</strong> applied.{" "}
              <button
                type="button"
                className="lulu-link-button"
                onClick={() => removeCoupon.mutate()}
                disabled={disabled || removeCoupon.isPending}
              >
                Remove
              </button>
            </p>
          )}
        </div>
        <div className="sec-total-price" style={{ opacity: isRefreshing ? 0.6 : 1 }} aria-busy={isRefreshing}>
          {totals ? (
            <>
              <div className="top">
                <div className="item d-flex align-items-center justify-content-between text-button">
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="item d-flex align-items-center justify-content-between text-button">
                    <span>Discounts</span>
                    <span>−{formatPrice(totals.discount)}</span>
                  </div>
                )}
                <div className="item d-flex align-items-center justify-content-between text-button">
                  <span>Shipping</span>
                  <span>{totals.shipping > 0 ? formatPrice(totals.shipping) : "Free"}</span>
                </div>
                {totals.codFee > 0 && (
                  <div className="item d-flex align-items-center justify-content-between text-button">
                    <span>Cash on Delivery fee</span>
                    <span>{formatPrice(totals.codFee)}</span>
                  </div>
                )}
              </div>
              <div className="bottom">
                <h5 className="d-flex justify-content-between">
                  <span>Total</span>
                  <span className="total-price-checkout">{formatPrice(totals.total)}</span>
                </h5>
                {messages.map((message) => (
                  <p key={message} className="text-caption-1 text-secondary mt_4 mb-0">
                    {message}
                  </p>
                ))}
              </div>
            </>
          ) : summaryQuery.isError ? (
            <div className="text-center py-3">
              <p className="mb_8">{summaryQuery.error?.message}</p>
              <button type="button" className="tf-btn btn-fill" onClick={() => summaryQuery.refetch()}>
                <span className="text text-button">Try again</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Calculating your total…</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
