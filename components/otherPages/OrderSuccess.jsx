"use client";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/useAuth";
import { useOrder } from "@/hooks/useOrders";
import { queryKeys } from "@/lib/query/keys";
import { formatAddress, formatPrice } from "@/lib/format";

// /order-success?id=123&order=LS20260001
export default function OrderSuccess() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("id");
  const orderNumber = params.get("order");
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  // Checkout leaves the new order in the cache. After a page reload, logged-in customers fetch it again;
  // guests can't (orders need a login), so they see the order number and the tracking link.
  const cached = orderId ? queryClient.getQueryData(queryKeys.orders.detail(orderId)) : undefined;
  const { data: order } = useOrder(orderId, { initialData: cached, enabled: Boolean(orderId && !cached && user) });

  const number = order?.number ?? orderNumber;
  const trackHref = user && orderId ? `/my-account-orders-details?id=${encodeURIComponent(orderId)}` : "/order-tracking";

  if (!number) {
    return (
      <section className="flat-spacing">
        <div className="container text-center" style={{ minHeight: "30vh" }}>
          <h4 className="mb_12">We couldn't find your order details</h4>
          <p className="mb_20 text-secondary">If you've just placed an order, check your email for the confirmation.</p>
          <Link href="/order-tracking" className="tf-btn btn-fill">
            <span className="text text-button">Track an order</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="mx-auto text-center" style={{ maxWidth: 640 }}>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb_20"
            style={{ width: 64, height: 64, backgroundColor: "#067647", color: "#fff", fontSize: 28 }}
            aria-hidden="true"
          >
            <i className="icon icon-check" />
          </div>
          <h3 className="mb_12">Thank you for your order!</h3>
          <p className="mb_8">
            Your order <strong>#{number}</strong> has been placed.
          </p>
          <p className="text-secondary mb_24">We've sent the confirmation to your email.</p>

          {order && (
            <div className="text-start border rounded-3 p-4 mb_24">
              <div className="d-flex justify-content-between mb_12">
                <span className="text-button">Total</span>
                <strong>{formatPrice(order.summary.total)}</strong>
              </div>
              <p className="mb_12">
                {order.paymentMethod === "cod"
                  ? `Cash on Delivery: please keep ${formatPrice(order.summary.total)} ready when your order arrives.`
                  : "Paid online."}
              </p>
              {order.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center gap-12 mb_8">
                  <Image src={item.imgSrc} alt={item.title} width={48} height={64} style={{ objectFit: "cover" }} />
                  <span className="flex-grow-1">{item.title}</span>
                  <span className="text-secondary">× {item.quantity}</span>
                </div>
              ))}
              {order.address && (
                <p className="mt_12 mb-0 text-secondary">
                  Delivering to {order.address.name}, {formatAddress(order.address)}
                </p>
              )}
            </div>
          )}

          <div className="d-flex gap-12 justify-content-center flex-wrap">
            <Link href={trackHref} className="tf-btn btn-fill">
              <span className="text text-button">Track your order</span>
            </Link>
            <Link href="/shop-default-grid" className="tf-btn btn-reset">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
