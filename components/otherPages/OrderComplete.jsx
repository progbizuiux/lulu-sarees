"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { usePaymentStatus, useRetryPayment } from "@/hooks/useCheckout";
import { queryKeys } from "@/lib/query/keys";
import { formatPrice } from "@/lib/format";
import { FormAlert } from "@/components/auth/FormMessages";

// How long to keep checking before telling the customer it's taking longer than usual.
const MAX_WAIT_MS = 2 * 60 * 1000;

const isSafePaymentUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || (parsed.protocol === "http:" && parsed.hostname === "localhost");
  } catch {
    return false;
  }
};

// The payment page sends the shopper here: /order-complete?order=<orderID>
export default function OrderComplete() {
  return (
    <Suspense fallback={null}>
      <OrderCompleteContent />
    </Suspense>
  );
}

function Panel({ icon, iconColor, title, children }) {
  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="mx-auto text-center" style={{ maxWidth: 640, minHeight: "30vh" }}>
          {icon && (
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb_20"
              style={{ width: 64, height: 64, backgroundColor: iconColor, color: "#fff", fontSize: 28 }}
              aria-hidden="true"
            >
              <i className={`icon ${icon}`} />
            </div>
          )}
          <h3 className="mb_12">{title}</h3>
          {children}
        </div>
      </div>
    </section>
  );
}

function OrderCompleteContent() {
  const orderId = useSearchParams().get("order");
  const queryClient = useQueryClient();
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const status = usePaymentStatus(orderId);
  const retryPayment = useRetryPayment();
  const [retryError, setRetryError] = useState(null);

  const paymentStatus = status.data?.paymentStatus;
  const isDone = paymentStatus === "paid" || paymentStatus === "cod";

  // Keep a clock running while waiting, so the "taking longer" message can appear.
  useEffect(() => {
    if (paymentStatus !== "pending") return;
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, [paymentStatus]);

  // Once paid, the cart is empty and the order list has a new order.
  useEffect(() => {
    if (!isDone) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  }, [isDone, queryClient]);

  const detailsHref = `/my-account-orders-details?id=${encodeURIComponent(orderId ?? "")}`;
  const number = status.data?.orderNumber;

  if (!orderId) {
    return (
      <Panel title="We couldn't find your order">
        <p className="mb_20 text-secondary">Check your orders to see its status.</p>
        <Link href="/my-account-orders" className="tf-btn btn-fill">
          <span className="text text-button">Your orders</span>
        </Link>
      </Panel>
    );
  }

  if (status.isError) {
    return (
      <Panel title="We couldn't check your payment">
        <p className="mb_20 text-secondary">{status.error?.message}</p>
        <div className="d-flex gap-12 justify-content-center flex-wrap">
          <button type="button" className="tf-btn btn-fill" onClick={() => status.refetch()} disabled={status.isFetching}>
            <span className="text text-button">{status.isFetching ? "Checking…" : "Check again"}</span>
          </button>
          <Link href="/my-account-orders" className="tf-btn btn-reset">
            Your orders
          </Link>
        </div>
      </Panel>
    );
  }

  if (isDone) {
    return (
      <Panel icon="icon-check" iconColor="#067647" title="Thank you for your order!">
        <p className="mb_8">
          Your order {number && <strong>#{number}</strong>} has been placed
          {paymentStatus === "paid" && <> and your payment of {formatPrice(status.data.total)} is confirmed</>}.
        </p>
        <p className="text-secondary mb_24">We've sent the confirmation to your email.</p>
        <div className="d-flex gap-12 justify-content-center flex-wrap">
          <Link href={detailsHref} className="tf-btn btn-fill">
            <span className="text text-button">View your order</span>
          </Link>
          <Link href="/shop-default-grid" className="tf-btn btn-reset">
            Continue shopping
          </Link>
        </div>
      </Panel>
    );
  }

  if (paymentStatus === "failed" || paymentStatus === "cancelled") {
    const tryAgain = () => {
      setRetryError(null);
      retryPayment.mutate(orderId, {
        onSuccess: (result) => {
          if (result.paymentUrl && isSafePaymentUrl(result.paymentUrl)) window.location.assign(result.paymentUrl);
          else setRetryError("The payment page couldn't be opened. Please try again from your orders.");
        },
        onError: (error) => setRetryError(error.message),
      });
    };
    return (
      <Panel title="Your payment didn't go through">
        <p className="mb_20 text-secondary">
          Your order {number && <strong>#{number}</strong>} is saved. No money was taken, or it will be refunded
          automatically. You can try paying again.
        </p>
        <FormAlert>{retryError}</FormAlert>
        <div className="d-flex gap-12 justify-content-center flex-wrap">
          <button type="button" className="tf-btn btn-fill" onClick={tryAgain} disabled={retryPayment.isPending}>
            <span className="text text-button">{retryPayment.isPending ? "Opening…" : "Pay now"}</span>
          </button>
          <Link href={detailsHref} className="tf-btn btn-reset">
            View your order
          </Link>
        </div>
      </Panel>
    );
  }

  // Still pending (or first check): keep waiting.
  const waitedTooLong = now - startedAt > MAX_WAIT_MS;
  return (
    <Panel title={waitedTooLong ? "Still confirming your payment" : "Confirming your payment…"}>
      {!waitedTooLong && (
        <div className="spinner-border mb_20" role="status">
          <span className="visually-hidden">Checking your payment</span>
        </div>
      )}
      <p className="text-secondary mb_20">
        {waitedTooLong
          ? "This is taking longer than usual. Please don't pay again. Your order's status will update in Your orders."
          : "Please don't close this page or pay again."}
      </p>
      {waitedTooLong && (
        <Link href={detailsHref} className="tf-btn btn-fill">
          <span className="text text-button">View your order</span>
        </Link>
      )}
    </Panel>
  );
}
