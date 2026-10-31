"use client";
import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCancelOrder, useOrder } from "@/hooks/useOrders";
import { useRetryPayment } from "@/hooks/useCheckout";
import { formatAddress, formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/orders/status";
import { confirmAction } from "@/lib/confirm";
import { notify } from "@/lib/notify";
import OrderTimeline from "./OrderTimeline";

const isSafePaymentUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || (parsed.protocol === "http:" && parsed.hostname === "localhost");
  } catch {
    return false;
  }
};

/** "Pay now" (unpaid online order) and "Cancel order": only when the ERP says they're allowed. */
function OrderActions({ order }) {
  const cancelOrder = useCancelOrder();
  const retryPayment = useRetryPayment();
  if (!order.canPay && !order.canCancel) return null;

  const payNow = () =>
    retryPayment.mutate(order.id, {
      onSuccess: (result) => {
        if (result.paymentUrl && isSafePaymentUrl(result.paymentUrl)) window.location.assign(result.paymentUrl);
        else notify("The payment page couldn't be opened. Please try again in a moment.", { type: "error" });
      },
      onError: (error) => notify(error.message, { type: "error" }),
    });

  const cancel = async () => {
    const confirmed = await confirmAction({
      title: "Cancel this order?",
      message: `Order #${order.number} will be cancelled.`,
      confirmLabel: "Cancel order",
    });
    if (!confirmed) return;
    cancelOrder.mutate(
      { orderId: order.id },
      { onSuccess: (result) => notify(result?.message || "Your order has been cancelled.", { type: "success" }) }
    );
  };

  return (
    <div className="d-flex gap-12 flex-wrap mb_20">
      {order.canPay && (
        <button type="button" className="tf-btn btn-fill radius-4" onClick={payNow} disabled={retryPayment.isPending}>
          <span className="text">{retryPayment.isPending ? "Opening…" : "Pay now"}</span>
        </button>
      )}
      {order.canCancel && (
        <button type="button" className="tf-btn btn-outline radius-4" onClick={cancel} disabled={cancelOrder.isPending}>
          <span className="text">{cancelOrder.isPending ? "Cancelling…" : "Cancel order"}</span>
        </button>
      )}
    </div>
  );
}

const paymentLabel = (order) => (order.paymentMethod === "cod" ? "Cash on Delivery" : "Online payment");

function Message({ children, action }) {
  return (
    <div className="my-account-content">
      <div className="py-5 text-center">
        <p className="mb_12">{children}</p>
        {action}
      </div>
    </div>
  );
}

const backToOrders = (
  <Link href="/my-account-orders" className="tf-btn btn-fill">
    <span className="text text-button">Back to your orders</span>
  </Link>
);

// The order id comes from the URL: /my-account-orders-details?id=123
export default function OrderDetails() {
  return (
    <Suspense fallback={null}>
      <OrderDetailsContent />
    </Suspense>
  );
}

function OrderDetailsContent() {
  const orderId = useSearchParams().get("id");
  const [activeTab, setActiveTab] = useState(1);
  const { data: order, isPending, isError, error, refetch, isFetching } = useOrder(orderId);

  if (!orderId) return <Message action={backToOrders}>Choose an order from your orders list.</Message>;

  if (isPending) {
    return (
      <div className="my-account-content">
        <div className="py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading your order…</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    if (error?.status === 404) return <Message action={backToOrders}>We couldn't find this order.</Message>;
    return (
      <Message
        action={
          <button type="button" className="tf-btn btn-fill" onClick={() => refetch()} disabled={isFetching}>
            <span className="text text-button">{isFetching ? "Trying again…" : "Try again"}</span>
          </button>
        }
      >
        {error?.message}
      </Message>
    );
  }

  const { summary, address, tracking } = order;
  const firstItem = order.items[0];
  const tabs = ["Order History", "Item Details", "Courier", "Receiver"];

  return (
    <div className="my-account-content">
      <div className="account-order-details">
        <div className="wd-form-order">
          <div className="order-head">
            {firstItem && (
              <figure className="img-product">
                <Image alt={firstItem.title} src={firstItem.imgSrc} width={600} height={800} />
              </figure>
            )}
            <div className="content">
              <div className="badge">{orderStatusLabel(order.status)}</div>
              <h6 className="mt-8 fw-5">Order #{order.number}</h6>
            </div>
          </div>
          <OrderActions order={order} />
          <div className="tf-grid-layout md-col-2 gap-15">
            <div className="item">
              <div className="text-2 text_black-2">Items</div>
              <div className="text-2 mt_4 fw-6">
                {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              </div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">Payment</div>
              <div className="text-2 mt_4 fw-6">{paymentLabel(order)}</div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">Placed on</div>
              <div className="text-2 mt_4 fw-6">{formatDate(order.createdAt, { withTime: true })}</div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">Delivery address</div>
              <div className="text-2 mt_4 fw-6">{formatAddress(address) || "—"}</div>
            </div>
          </div>
          <div className="widget-tabs style-3 widget-order-tab">
            <ul className="widget-menu-tab" role="tablist">
              {tabs.map((label, index) => (
                <li
                  key={label}
                  role="tab"
                  aria-selected={activeTab === index + 1}
                  tabIndex={0}
                  className={`item-title ${activeTab === index + 1 ? "active" : ""}`}
                  onClick={() => setActiveTab(index + 1)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setActiveTab(index + 1);
                  }}
                >
                  <span className="inner">{label}</span>
                </li>
              ))}
            </ul>
            <div className="widget-content-tab">
              <div className={`widget-content-inner ${activeTab === 1 ? "active" : ""}`} role="tabpanel">
                <OrderTimeline order={order} />
              </div>
              <div className={`widget-content-inner ${activeTab === 2 ? "active" : ""}`} role="tabpanel">
                {order.items.map((item) => (
                  <div className="order-head" key={item.id}>
                    <figure className="img-product">
                      <Image alt={item.title} src={item.imgSrc} width={600} height={800} />
                    </figure>
                    <div className="content">
                      <div className="text-2 fw-6">{item.title}</div>
                      <div className="mt_4">
                        <span className="fw-6">Price :</span> {formatPrice(item.price)} × {item.quantity}
                      </div>
                      {item.variantName && (
                        <div className="mt_4">
                          <span className="fw-6">Variant :</span> {item.variantName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <ul>
                  <li className="d-flex justify-content-between text-2">
                    <span>Subtotal</span>
                    <span className="fw-6">{formatPrice(summary.subtotal)}</span>
                  </li>
                  {summary.discount > 0 && (
                    <li className="d-flex justify-content-between text-2 mt_4">
                      <span>Discount</span>
                      <span className="fw-6">−{formatPrice(summary.discount)}</span>
                    </li>
                  )}
                  <li className="d-flex justify-content-between text-2 mt_4">
                    <span>Shipping</span>
                    <span className="fw-6">{summary.shipping > 0 ? formatPrice(summary.shipping) : "Free"}</span>
                  </li>
                  {summary.codFee > 0 && (
                    <li className="d-flex justify-content-between text-2 mt_4">
                      <span>Cash on Delivery fee</span>
                      <span className="fw-6">{formatPrice(summary.codFee)}</span>
                    </li>
                  )}
                  <li className="d-flex justify-content-between text-2 mt_8 pt_8 line-top">
                    <span>Order Total</span>
                    <span className="fw-6">{formatPrice(summary.total)}</span>
                  </li>
                </ul>
              </div>
              <div className={`widget-content-inner ${activeTab === 3 ? "active" : ""}`} role="tabpanel">
                {tracking ? (
                  <ul>
                    {tracking.courier && (
                      <li>
                        Courier : <span className="fw-7">{tracking.courier}</span>
                      </li>
                    )}
                    {tracking.trackingNumber && (
                      <li className="mt_4">
                        Tracking number : <span className="fw-7">{tracking.trackingNumber}</span>
                        {tracking.trackingUrl && (
                          <>
                            {" "}
                            <a href={tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="link">
                              Track on courier site
                            </a>
                          </>
                        )}
                      </li>
                    )}
                    {tracking.estimatedDelivery && (
                      <li className="mt_4">
                        Estimated delivery : <span className="fw-7">{formatDate(tracking.estimatedDelivery)}</span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p>Courier details will appear here once your order ships.</p>
                )}
              </div>
              <div className={`widget-content-inner ${activeTab === 4 ? "active" : ""}`} role="tabpanel">
                <ul>
                  {address?.name && (
                    <li>
                      Name : <span className="fw-7">{address.name}</span>
                    </li>
                  )}
                  {address?.phone && (
                    <li className="mt_4">
                      Phone : <span className="fw-7">{address.phone}</span>
                    </li>
                  )}
                  <li className="mt_4">
                    Address : <span className="fw-7">{formatAddress(address) || "—"}</span>
                  </li>
                  <li className="mt_20">
                    Order Number : <span className="fw-7">#{order.number}</span>
                  </li>
                  <li className="mt_4">
                    Date : <span className="fw-7">{formatDate(order.createdAt, { withTime: true })}</span>
                  </li>
                  <li className="mt_4">
                    Total : <span className="fw-7">{formatPrice(summary.total)}</span>
                  </li>
                  <li className="mt_4">
                    Payment Method : <span className="fw-7">{paymentLabel(order)}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
