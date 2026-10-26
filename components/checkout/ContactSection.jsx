"use client";
import Link from "next/link";
import { loginUrl } from "@/lib/auth/redirect";
import { FieldError, errorProps } from "@/components/auth/FormMessages";

/** Who the order is for: the logged-in customer, or a guest's email (for the confirmation and tracking). */
export default function ContactSection({ user, email, onEmailChange, error }) {
  if (user) {
    return (
      <div className="wrap">
        <h5 className="title">Contact</h5>
        <p>
          Logged in as <strong>{user.email}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="title-login">
        <p>Already have an account?</p>{" "}
        <Link href={loginUrl("/checkout")} className="text-button">
          Login here
        </Link>
      </div>
      <h5 className="title">Contact</h5>
      <div className="info-box">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email Address*"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            aria-label="Email address"
            aria-required="true"
            {...errorProps("checkout-email-error", error)}
          />
          <FieldError id="checkout-email-error" message={error} />
        </div>
        <p className="text-caption-1 text-secondary">
          We'll send your order confirmation here. You can use it to track your order.
        </p>
      </div>
    </div>
  );
}
