"use client";

import Link from "next/link";
import { useState } from "react";
import { useRedirectIfLoggedIn, useRegister } from "@/hooks/useAuth";
import { hasErrors, normalizeIndianMobile, validateRegister } from "@/lib/validation";
import { FieldError, FormAlert, errorProps, readFormErrors } from "@/components/auth/FormMessages";

export default function Register() {
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [clientErrors, setClientErrors] = useState({});
  const register = useRegister();

  // Logged in after registering (or already): go to ?redirect= or My Account.
  useRedirectIfLoggedIn();

  const togglePassword = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (register.isPending) return;

    const form = new FormData(event.currentTarget);
    const values = {
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
      agree: form.get("agree") === "on",
    };

    const errors = validateRegister(values);
    setClientErrors(errors);
    if (hasErrors(errors)) return;

    // Only what the backend needs; the confirm field and checkbox are checked above.
    register.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: normalizeIndianMobile(values.phone), // "+91 98765 43210" -> "9876543210"
      password: values.password,
    });
  };

  const { fieldErrors, general } = readFormErrors(register.error, clientErrors);

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4>Register</h4>
            </div>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="form-login form-has-password"
            >
              <div className="wrap">
                <div className="cols">
                  <div>
                    <fieldset className="">
                      <input
                        className=""
                        type="text"
                        placeholder="First Name*"
                        name="firstName"
                        autoComplete="given-name"
                        maxLength={50}
                        tabIndex={2}
                        defaultValue=""
                        aria-required="true"
                        required
                        {...errorProps("register-first-name-error", fieldErrors.firstName)}
                      />
                    </fieldset>
                    <FieldError id="register-first-name-error" message={fieldErrors.firstName} />
                  </div>
                  <div>
                    <fieldset className="">
                      <input
                        className=""
                        type="text"
                        placeholder="Last Name"
                        name="lastName"
                        autoComplete="family-name"
                        maxLength={50}
                        tabIndex={2}
                        defaultValue=""
                        {...errorProps("register-last-name-error", fieldErrors.lastName)}
                      />
                    </fieldset>
                    <FieldError id="register-last-name-error" message={fieldErrors.lastName} />
                  </div>
                </div>
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
                      {...errorProps("register-email-error", fieldErrors.email)}
                    />
                  </fieldset>
                  <FieldError id="register-email-error" message={fieldErrors.email} />
                </div>
                <div>
                  <fieldset className="">
                    <input
                      className=""
                      type="tel"
                      placeholder="Mobile number*"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={15}
                      tabIndex={2}
                      defaultValue=""
                      aria-required="true"
                      required
                      {...errorProps("register-phone-error", fieldErrors.phone)}
                    />
                  </fieldset>
                  <FieldError id="register-phone-error" message={fieldErrors.phone} />
                </div>
                <div>
                  <fieldset className="position-relative password-item">
                    <input
                      className="input-password"
                      type={passwordType}
                      placeholder="Password*"
                      name="password"
                      autoComplete="new-password"
                      tabIndex={2}
                      defaultValue=""
                      aria-required="true"
                      required
                      {...errorProps("register-password-error", fieldErrors.password)}
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
                  <FieldError id="register-password-error" message={fieldErrors.password} />
                </div>

                <div>
                  <fieldset className="position-relative password-item">
                    <input
                      className="input-password"
                      type={confirmPasswordType}
                      placeholder="Confirm Password*"
                      name="confirmPassword"
                      autoComplete="new-password"
                      tabIndex={2}
                      defaultValue=""
                      aria-required="true"
                      required
                      {...errorProps("register-confirm-error", fieldErrors.confirmPassword)}
                    />
                    <span
                      className={`toggle-password ${
                        !(confirmPasswordType === "text") ? "unshow" : ""
                      }`}
                      onClick={toggleConfirmPassword}
                    >
                      <i
                        className={`icon-eye-${
                          !(confirmPasswordType === "text") ? "hide" : "show"
                        }-line`}
                      />
                    </span>
                  </fieldset>
                  <FieldError id="register-confirm-error" message={fieldErrors.confirmPassword} />
                </div>
                <div>
                  <div className="d-flex align-items-center">
                    <div className="tf-cart-checkbox">
                      <div className="tf-checkbox-wrapp">
                        <input
                          defaultChecked
                          className=""
                          type="checkbox"
                          id="login-form_agree"
                          name="agree"
                          {...errorProps("register-agree-error", fieldErrors.agree)}
                        />
                        <div>
                          <i className="icon-check" />
                        </div>
                      </div>
                      <label
                        className="text-secondary-2"
                        htmlFor="login-form_agree"
                      >
                        I agree to the&nbsp;
                      </label>
                    </div>
                    <Link href={`/term-of-use`} title="Terms of Service">
                      Terms of Use
                    </Link>
                  </div>
                  <FieldError id="register-agree-error" message={fieldErrors.agree} />
                </div>
              </div>
              <FormAlert>{general}</FormAlert>
              <div className="button-submit">
                <button
                  className="tf-btn btn-fill"
                  type="submit"
                  disabled={register.isPending}
                  aria-busy={register.isPending}
                >
                  <span className="text text-button">
                    {register.isPending ? "Creating account…" : "Register"}
                  </span>
                </button>
              </div>
            </form>
          </div>
          <div className="right">
            <h4 className="mb_8">Already have an account?</h4>
            <p className="text-secondary">
              Welcome back. Sign in to access your personalized experience,
              saved preferences, and more. We're thrilled to have you with us
              again!
            </p>
            <Link href={`/login`} className="tf-btn btn-fill">
              <span className="text text-button">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
