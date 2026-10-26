// Customer-friendly names for order statuses. Backend codes are lower-cased by the order mapper.
// Add or rename entries here when the backend's real status list is known.
const LABELS = {
  pending_payment: "Awaiting payment",
  placed: "Order placed",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
  payment_failed: "Payment failed",
};

export function orderStatusLabel(status) {
  if (!status) return "";
  const key = String(status).toLowerCase().replace(/[\s-]+/g, "_");
  if (LABELS[key]) return LABELS[key];
  const words = key.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
