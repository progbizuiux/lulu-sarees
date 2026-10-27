// Razorpay Checkout: loads Razorpay's script once and opens its payment window.
// Card/UPI details are typed into Razorpay's window, never into our site.
// Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise = null;

export function loadRazorpay() {
  if (typeof window === "undefined") return Promise.reject(new Error("Payments can only start in the browser."));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () =>
        window.Razorpay ? resolve(window.Razorpay) : reject(new Error("The payment window didn't load."));
      script.onerror = () => {
        scriptPromise = null; // allow another try
        script.remove();
        reject(new Error("Couldn't load the payment window. Check your connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Opens the Razorpay window for an order the backend has already created.
 * Resolves (never rejects) with one of:
 *   { status: "paid", gatewayOrderId, gatewayPaymentId, signature }  → send these to the backend to verify
 *   { status: "failed", message }
 *   { status: "cancelled" }
 *
 * @param {{
 *   payment: {key: string, gatewayOrderId: string, currency?: string},
 *   order: {number: string},
 *   prefill?: {name?: string, email?: string, phone?: string},
 * }} options
 */
export async function openRazorpay({ payment, order, prefill = {} }) {
  let Razorpay;
  try {
    Razorpay = await loadRazorpay();
  } catch (error) {
    return { status: "failed", message: error.message };
  }

  return new Promise((resolve) => {
    let settled = false;
    let lastFailure = null;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const checkout = new Razorpay({
      key: payment.key, // public key id from the backend, never the secret
      order_id: payment.gatewayOrderId, // the amount is taken from this Razorpay order, set by the backend
      name: "Lulu Sarees",
      description: `Order #${order.number}`,
      prefill: { name: prefill.name, email: prefill.email, contact: prefill.phone },
      notes: { orderNumber: order.number },
      theme: { color: "#181818" },
      handler: (response) =>
        finish({
          status: "paid",
          gatewayOrderId: response.razorpay_order_id,
          gatewayPaymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }),
      modal: {
        confirm_close: true,
        // Closing the window after a failed attempt counts as a failure; otherwise as cancelled.
        ondismiss: () => finish(lastFailure ? { status: "failed", message: lastFailure } : { status: "cancelled" }),
      },
    });

    // Razorpay keeps its window open after a failed attempt so the customer can try another method.
    checkout.on("payment.failed", (response) => {
      lastFailure = response?.error?.description || "The payment didn't go through.";
    });

    checkout.open();
  });
}
