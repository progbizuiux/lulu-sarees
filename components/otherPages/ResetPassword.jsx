"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "@/hooks/useAuth";
import { hasErrors, validateResetPassword } from "@/lib/validation";
import { FieldError, FormAlert, errorProps, readFormErrors } from "@/components/auth/FormMessages";

// The password-reset email links here: /reset-password?token=...
// The link works once, for one hour. Changing the password signs the customer out on other devices.
export default function ResetPassword() {
  const token = useSearchParams().get("token") ?? "";
  const [passwordType, setPasswordType] = useState("password");
  const [clientErrors, setClientErrors] = useState({});
  const resetPassword = useResetPassword();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (resetPassword.isPending) return;

    const form = new FormData(event.currentTarget);
    const values = {
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    };

    const errors = validateResetPassword(values);
    setClientErrors(errors);
    if (hasErrors(errors)) return;

    resetPassword.mutate({ token, newPassword: values.password });
  };

  const { fieldErrors, general } = readFormErrors(resetPassword.error, clientErrors);
  const toggleType = () => setPasswordType((type) => (type === "password" ? "text" : "password"));

  let content;
  if (!token) {
    content = (
      <>
        <FormAlert>This reset link isn't complete. Please request a new one.</FormAlert>
        <Link href="/forget-password" className="tf-btn btn-fill">
          <span className="text text-button">Request a new link</span>
        </Link>
      </>
    );
  } else if (resetPassword.isSuccess) {
    content = (
      <>
        <FormAlert type="success">Your password has been changed. Please log in with your new password.</FormAlert>
        <Link href="/login" className="tf-btn btn-fill">
          <span className="text text-button">Login</span>
        </Link>
      </>
    );
  } else {
    content = (
      <form onSubmit={handleSubmit} noValidate className="form-login form-has-password">
        <div className="wrap">
          {["password", "confirmPassword"].map((name) => (
            <div key={name}>
              <fieldset className="position-relative password-item">
                <input
                  className="input-password"
                  type={passwordType}
                  placeholder={name === "password" ? "New password*" : "Confirm new password*"}
                  name={name}
                  autoComplete="new-password"
                  defaultValue=""
                  aria-required="true"
                  required
                  {...errorProps(`reset-${name}-error`, fieldErrors[name])}
                />
                <span
                  className={`toggle-password ${passwordType === "text" ? "" : "unshow"}`}
                  onClick={toggleType}
                >
                  <i className={`icon-eye-${passwordType === "text" ? "show" : "hide"}-line`} />
                </span>
              </fieldset>
              <FieldError id={`reset-${name}-error`} message={fieldErrors[name]} />
            </div>
          ))}
        </div>
        <FormAlert>{general}</FormAlert>
        {general && (
          <p className="small mb-3">
            Link expired? <Link href="/forget-password" className="link text-decoration-underline">Request a new one</Link>.
          </p>
        )}
        <div className="button-submit">
          <button
            className="tf-btn btn-fill"
            type="submit"
            disabled={resetPassword.isPending}
            aria-busy={resetPassword.isPending}
          >
            <span className="text text-button">{resetPassword.isPending ? "Saving…" : "Change password"}</span>
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4 className="mb_8">Choose a new password</h4>
              <p>At least 8 characters.</p>
            </div>
            {content}
          </div>
          <div className="right">
            <h4 className="mb_8">Remembered it?</h4>
            <p className="text-secondary">Go back and log in with your current password.</p>
            <Link href="/login" className="tf-btn btn-fill">
              <span className="text text-button">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
