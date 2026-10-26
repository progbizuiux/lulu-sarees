"use client";

const METHODS = [
  {
    value: "online",
    title: "Pay online",
    description:
      "UPI, cards, net banking or wallets. You'll pay in Razorpay's secure window; we never see your card details.",
  },
  {
    value: "cod",
    title: "Cash on Delivery",
    description: "Pay in cash when your order arrives. A small COD fee may apply; it's shown in the order summary.",
  },
];

/** Online (Razorpay) or Cash on Delivery (template payment markup). COD is disabled, with a reason, when unavailable. */
export default function PaymentSection({ value, onChange, codAvailable, codUnavailableReason, disabled }) {
  return (
    <div className="wrap">
      <h5 className="title">Payment</h5>
      <div className="form-payment">
        <div className="payment-box" role="radiogroup" aria-label="Payment method">
          {METHODS.map((method) => {
            const id = `payment-${method.value}`;
            const unavailable = method.value === "cod" && !codAvailable;
            const checked = value === method.value;
            return (
              <div
                key={method.value}
                className={`payment-item ${checked ? "active" : ""}`}
                style={{ opacity: unavailable ? 0.6 : 1 }}
              >
                <label htmlFor={id} className="payment-header">
                  <input
                    type="radio"
                    name="payment-method"
                    className="tf-check-rounded"
                    id={id}
                    checked={checked}
                    disabled={disabled || unavailable}
                    onChange={() => onChange(method.value)}
                  />
                  <span className="text-title">{method.title}</span>
                </label>
                <div className="payment-body">
                  <p className="text-secondary mb-0">
                    {unavailable ? codUnavailableReason : method.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
