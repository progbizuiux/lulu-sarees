"use client";
import React from "react";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/orders/status";

/** "Your Orders": the logged-in customer's orders, from the order service. */
export default function Orers() {
  const { data: orders, isPending, isError, error, refetch, isFetching } = useOrders();

  let content;
  if (isPending) {
    content = (
      <div className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading your orders…</span>
        </div>
      </div>
    );
  } else if (isError) {
    content = (
      <div className="py-5 text-center">
        <p className="mb_12">{error?.message}</p>
        <button type="button" className="tf-btn btn-fill" onClick={() => refetch()} disabled={isFetching}>
          <span className="text text-button">{isFetching ? "Trying again…" : "Try again"}</span>
        </button>
      </div>
    );
  } else if (!orders.length) {
    content = (
      <div className="py-5 text-center">
        <p className="mb_12">You haven't placed any orders yet.</p>
        <Link href="/shop-default-grid" className="tf-btn btn-fill">
          <span className="text text-button">Start shopping</span>
        </Link>
      </div>
    );
  } else {
    content = (
      <div className="wrap-account-order">
        <table>
          <thead>
            <tr>
              <th className="fw-6">Order</th>
              <th className="fw-6">Date</th>
              <th className="fw-6">Status</th>
              <th className="fw-6">Total</th>
              <th className="fw-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="tf-order-item">
                <td>#{order.number}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{orderStatusLabel(order.status)}</td>
                <td>
                  {formatPrice(order.summary.total)} for {order.itemCount}{" "}
                  {order.itemCount === 1 ? "item" : "items"}
                </td>
                <td>
                  <Link
                    href={`/my-account-orders-details?id=${encodeURIComponent(order.id)}`}
                    className="tf-btn btn-fill radius-4"
                    aria-label={`View order ${order.number}`}
                  >
                    <span className="text">View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="account-orders">{content}</div>
    </div>
  );
}
