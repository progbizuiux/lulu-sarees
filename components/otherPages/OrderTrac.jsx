"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useTrackOrder } from "@/hooks/useOrders";
import { useUser } from "@/hooks/useAuth";
import { hasErrors, normalizeIndianMobile, validateTrackOrder } from "@/lib/validation";
import { formatDate } from "@/lib/format";
import { orderStatusLabel } from "@/lib/orders/status";
import { FieldError, FormAlert, errorProps, readFormErrors } from "@/components/auth/FormMessages";
import OrderTimeline from "@/components/my-account/OrderTimeline";

/**
 * Track an order without logging in: order number + the email or phone used for the order.
 * The backend gives the same answer for any wrong detail, so nobody can guess other people's orders.
 */
export default function OrderTrac() {
  const [clientErrors, setClientErrors] = useState({});
  const trackOrder = useTrackOrder();
  const { data: user } = useUser();
  const order = trackOrder.data;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (trackOrder.isPending) return;

    const form = new FormData(event.currentTarget);
    const values = {
      orderNumber: String(form.get("orderNumber") ?? "").trim().replace(/^#/, ""),
      contact: String(form.get("contact") ?? "").trim(),
    };
    const errors = validateTrackOrder(values);
    setClientErrors(errors);
    if (hasErrors(errors)) return;

    // "+91 98765 43210" -> "9876543210"
    trackOrder.mutate({ ...values, contact: normalizeIndianMobile(values.contact) });
  };

  const { fieldErrors, general } = readFormErrors(trackOrder.error, clientErrors);

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap tracking-wrap">
          <div className="left">
            <div className="heading">
              <h4 className="mb_8">Order Tracking</h4>
              <p>
                Enter your order number and the mobile number you used when ordering. You'll find the
                order number in your confirmation email.
              </p>
            </div>
            <form onSubmit={handleSubmit} noValidate className="form-login">
              <div className="wrap">
                <div>
                  <fieldset>
                    <input
                      type="text"
                      name="orderNumber"
                      placeholder="Order number*"
                      autoComplete="off"
                      aria-label="Order number"
                      aria-required="true"
                      {...errorProps("track-order-number-error", fieldErrors.orderNumber)}
                    />
                  </fieldset>
                  <FieldError id="track-order-number-error" message={fieldErrors.orderNumber} />
                </div>
                <div>
                  <fieldset>
                    <input
                      type="tel"
                      name="contact"
                      placeholder="Mobile number*"
                      autoComplete="tel"
                      inputMode="tel"
                      aria-label="Mobile number"
                      aria-required="true"
                      {...errorProps("track-contact-error", fieldErrors.contact)}
                    />
                  </fieldset>
                  <FieldError id="track-contact-error" message={fieldErrors.contact} />
                </div>
              </div>
              <FormAlert>{general}</FormAlert>
              <div className="button-submit">
                <button
                  className="tf-btn btn-fill"
                  type="submit"
                  disabled={trackOrder.isPending}
                  aria-busy={trackOrder.isPending}
                >
                  <span className="text">{trackOrder.isPending ? "Finding your order…" : "Track Order"}</span>
                </button>
              </div>
            </form>
            {order && (
              <div className="mt-5 pt-4 border-top" aria-live="polite">
                <h5 className="mb_8">Order #{order.number}</h5>
                <p className="mb_4">
                  Status: <strong>{orderStatusLabel(order.status)}</strong>
                </p>
                <p className="mb_12 text-secondary">Placed on {formatDate(order.createdAt)}</p>
                {order.tracking?.trackingNumber && (
                  <p className="mb_12">
                    {order.tracking.courier && <>{order.tracking.courier} · </>}
                    Tracking number <strong>{order.tracking.trackingNumber}</strong>
                    {order.tracking.estimatedDelivery && (
                      <> · Expected by {formatDate(order.tracking.estimatedDelivery)}</>
                    )}
                  </p>
                )}
                <OrderTimeline order={order} />
              </div>
            )}
          </div>
          <div className="right">
            {user ? (
              <>
                <h4 className="mb_8">Your orders</h4>
                <p className="text-secondary">See all your orders and their details in your account.</p>
                <Link href={`/my-account-orders`} className="tf-btn btn-fill">
                  <span className="text">View your orders</span>
                </Link>
              </>
            ) : (
              <>
                <h4 className="mb_8">Already have an account?</h4>
                <p className="text-secondary">
                  Log in to see all your orders, track deliveries and reorder your favourites.
                </p>
                <Link href={`/login?redirect=${encodeURIComponent("/my-account-orders")}`} className="tf-btn btn-fill">
                  <span className="text">Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
