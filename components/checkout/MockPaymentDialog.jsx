"use client";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/format";

/**
 * A pretend Razorpay window, used only in mock mode (no real payment keys).
 * Lets every outcome be tested: success, failure and closing the window.
 */
export default function MockPaymentDialog({ order, amount, onResult }) {
  const payButton = useRef(null);

  useEffect(() => {
    payButton.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onResult({ status: "cancelled" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onResult]);

  return (
    <div className="lulu-mock-payment" role="dialog" aria-modal="true" aria-labelledby="mock-payment-title">
      <div className="lulu-mock-payment__box">
        <p className="text-caption-1 text-secondary mb_4">Test mode · no real money</p>
        <h5 id="mock-payment-title" className="mb_8">
          Pay {formatPrice(amount)}
        </h5>
        <p className="mb_20">Order #{order.number}</p>
        <div className="d-flex flex-column gap-10">
          <button
            ref={payButton}
            type="button"
            className="tf-btn btn-fill w-100"
            onClick={() =>
              onResult({
                status: "paid",
                gatewayOrderId: `mock_order_${order.id}`,
                gatewayPaymentId: `mock_pay_${Date.now()}`,
                signature: "mock_signature",
              })
            }
          >
            <span className="text">Pay successfully</span>
          </button>
          <button
            type="button"
            className="tf-btn btn-outline w-100"
            onClick={() => onResult({ status: "failed", message: "Your bank declined the payment (test)." })}
          >
            <span className="text">Make the payment fail</span>
          </button>
          <button type="button" className="lulu-link-button" onClick={() => onResult({ status: "cancelled" })}>
            Close without paying
          </button>
        </div>
      </div>
    </div>
  );
}
