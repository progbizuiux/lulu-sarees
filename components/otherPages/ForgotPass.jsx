"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/hooks/useAuth";
import { validateEmail } from "@/lib/validation";
import { FieldError, FormAlert, errorProps, readFormErrors } from "@/components/auth/FormMessages";

export default function ForgotPass() {
  const [clientErrors, setClientErrors] = useState({});
  const forgotPassword = useForgotPassword();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (forgotPassword.isPending) return;

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const emailError = validateEmail(email);
    setClientErrors(emailError ? { email: emailError } : {});
    if (emailError) return;

    forgotPassword.mutate({ email });
  };

  const { fieldErrors, general } = readFormErrors(forgotPassword.error, clientErrors);

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4 className="mb_8">Reset your password</h4>
              <p>We will send you an email to reset your password</p>
            </div>
            {forgotPassword.isSuccess ? (
              // Same message whether or not the email has an account, so the form can't be used
              // to find out who is registered.
              <FormAlert type="success">
                If an account exists for {forgotPassword.variables?.email}, you'll get an email with a
                link to reset your password. Check your spam folder too.
              </FormAlert>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="form-login">
                <div className="wrap">
                  <div>
                    <fieldset className="">
                      <input
                        className=""
                        type="email"
                        placeholder="Email address*"
                        name="email"
                        autoComplete="email"
                        tabIndex={2}
                        defaultValue=""
                        aria-required="true"
                        required
                        {...errorProps("forgot-email-error", fieldErrors.email)}
                      />
                    </fieldset>
                    <FieldError id="forgot-email-error" message={fieldErrors.email} />
                  </div>
                </div>
                <FormAlert>{general}</FormAlert>
                <div className="button-submit">
                  <button
                    className="tf-btn btn-fill"
                    type="submit"
                    disabled={forgotPassword.isPending}
                    aria-busy={forgotPassword.isPending}
                  >
                    <span className="text text-button">
                      {forgotPassword.isPending ? "Sending…" : "Submit"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="right">
            <h4 className="mb_8">New Customer</h4>
            <p className="text-secondary">
              Be part of our growing family of new customers! Join us today and
              unlock a world of exclusive benefits, offers, and personalized
              experiences.
            </p>
            <Link href={`/register`} className="tf-btn btn-fill">
              <span className="text text-button">Register</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
