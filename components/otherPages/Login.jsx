"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useLogin, useRedirectIfLoggedIn } from "@/hooks/useAuth";
import { hasErrors, normalizeIndianMobile, validateLogin } from "@/lib/validation";
import { FieldError, FormAlert, errorProps, readFormErrors } from "@/components/auth/FormMessages";

export default function Login() {
  const [passwordType, setPasswordType] = useState("password");
  const [clientErrors, setClientErrors] = useState({});
  const login = useLogin();

  // Already logged in, or just logged in: go to ?redirect= or My Account.
  useRedirectIfLoggedIn();

  const togglePassword = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (login.isPending) return;

    const form = new FormData(event.currentTarget);
    const values = {
      login: String(form.get("login") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      rememberMe: form.get("rememberMe") === "on",
    };

    const errors = validateLogin(values);
    setClientErrors(errors);
    if (hasErrors(errors)) return;

    // "+91 98765 43210" -> "9876543210"; emails are sent as typed.
    login.mutate({ ...values, login: normalizeIndianMobile(values.login) || values.login });
  };

  const { fieldErrors, general } = readFormErrors(login.error, clientErrors);

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4>Login</h4>
            </div>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="form-login form-has-password"
            >
              <div className="wrap">
                <div>
                  <fieldset className="">
                    <input
                      className=""
                      type="text"
                      placeholder="Email or mobile number*"
                      name="login"
                      autoComplete="username"
                      tabIndex={2}
                      defaultValue=""
                      aria-required="true"
                      required
                      {...errorProps("login-email-error", fieldErrors.login)}
                    />
                  </fieldset>
                  <FieldError id="login-email-error" message={fieldErrors.login} />
                </div>
                <div>
                  <fieldset className="position-relative password-item">
                    <input
                      className="input-password"
                      type={passwordType}
                      placeholder="Password*"
                      name="password"
                      autoComplete="current-password"
                      tabIndex={2}
                      defaultValue=""
                      aria-required="true"
                      required
                      {...errorProps("login-password-error", fieldErrors.password)}
                    />
                    <span
                      className={`toggle-password ${
                        !(passwordType === "text") ? "unshow" : ""
                      }`}
                      onClick={togglePassword}
                    >
                      <i
                        className={`icon-eye-${
                          !(passwordType === "text") ? "hide" : "show"
                        }-line`}
                      />
                    </span>
                  </fieldset>
                  <FieldError id="login-password-error" message={fieldErrors.password} />
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="tf-cart-checkbox">
                    <div className="tf-checkbox-wrapp">
                      <input
                        defaultChecked
                        className=""
                        type="checkbox"
                        id="login-form_agree"
                        name="rememberMe"
                      />
                      <div>
                        <i className="icon-check" />
                      </div>
                    </div>
                    <label htmlFor="login-form_agree"> Remember me </label>
                  </div>
                  <Link
                    href={`/forget-password`}
                    className="font-2 text-button forget-password link"
                  >
                    Forgot Your Password?
                  </Link>
                </div>
              </div>
              <FormAlert>{general}</FormAlert>
              <div className="button-submit">
                <button
                  className="tf-btn btn-fill"
                  type="submit"
                  disabled={login.isPending}
                  aria-busy={login.isPending}
                >
                  <span className="text text-button">
                    {login.isPending ? "Logging in…" : "Login"}
                  </span>
                </button>
              </div>
            </form>
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
