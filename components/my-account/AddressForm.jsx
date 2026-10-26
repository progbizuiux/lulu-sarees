"use client";
import { useState } from "react";
import { indianStates } from "@/data/indianStates";
import { hasErrors, normalizeIndianMobile, validateAddress } from "@/lib/validation";
import { FieldError, FormAlert, errorProps, readFormErrors } from "@/components/auth/FormMessages";

const ADDRESS_LABELS = ["Home", "Work", "Other"];

/**
 * Indian address form (template styling). Used by the address book, and by checkout in Phase 4.
 * Checks the fields first, then calls onSubmit(values) with a clean 10-digit phone number.
 *
 * @param {{
 *   idPrefix: string,               // keeps input ids unique when several forms are on the page
 *   className?: string,
 *   title?: string,
 *   initialValues?: Object,
 *   submitLabel?: string,
 *   onSubmit: (values: Object) => void,
 *   onCancel?: () => void,
 *   isPending?: boolean,
 *   error?: import("@/lib/api/errors").ApiError|null,
 *   showDefaultOption?: boolean,
 * }} props
 */
export default function AddressForm({
  idPrefix,
  className = "wd-form-address",
  title,
  initialValues = {},
  submitLabel = "Save address",
  onSubmit,
  onCancel,
  isPending = false,
  error = null,
  showDefaultOption = true,
}) {
  const [clientErrors, setClientErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPending) return;

    const form = new FormData(event.currentTarget);
    const text = (name) => String(form.get(name) ?? "").trim();
    const values = {
      label: text("label"),
      firstName: text("firstName"),
      lastName: text("lastName"),
      phone: text("phone"),
      line1: text("line1"),
      line2: text("line2"),
      city: text("city"),
      state: text("state"),
      pincode: text("pincode"),
      country: "India",
      isDefault: form.get("isDefault") === "on",
    };

    const errors = validateAddress(values);
    setClientErrors(errors);
    if (hasErrors(errors)) return;

    onSubmit({ ...values, phone: normalizeIndianMobile(values.phone) });
  };

  const { fieldErrors, general } = readFormErrors(error, clientErrors);

  // One text field with its error message underneath.
  const field = (name, placeholder, props = {}) => {
    const errorId = `${idPrefix}-${name}-error`;
    return (
      <div>
        <fieldset>
          <input
            type="text"
            name={name}
            placeholder={placeholder}
            defaultValue={initialValues[name] ?? ""}
            aria-label={placeholder.replace("*", "")}
            {...errorProps(errorId, fieldErrors[name])}
            {...props}
          />
        </fieldset>
        <FieldError id={errorId} message={fieldErrors[name]} />
      </div>
    );
  };

  return (
    <form className={className} onSubmit={handleSubmit} noValidate>
      {title && <div className="title">{title}</div>}
      <div className="cols mb_20">
        {field("firstName", "First Name*", { autoComplete: "given-name", maxLength: 50, "aria-required": "true" })}
        {field("lastName", "Last Name", { autoComplete: "family-name", maxLength: 50 })}
      </div>
      <div className="cols mb_20">
        {field("phone", "Mobile number*", {
          type: "tel",
          inputMode: "numeric",
          autoComplete: "tel-national",
          maxLength: 16,
          "aria-required": "true",
        })}
        {field("pincode", "Pincode*", {
          inputMode: "numeric",
          autoComplete: "postal-code",
          maxLength: 6,
          "aria-required": "true",
        })}
      </div>
      <div className="mb_20">
        {field("line1", "House no., building, street*", {
          autoComplete: "address-line1",
          maxLength: 120,
          "aria-required": "true",
        })}
      </div>
      <div className="mb_20">
        {field("line2", "Area, landmark (optional)", { autoComplete: "address-line2", maxLength: 120 })}
      </div>
      <div className="cols mb_20">
        {field("city", "City*", { autoComplete: "address-level2", maxLength: 60, "aria-required": "true" })}
        <div>
          <div className="tf-select">
            <select
              name="state"
              defaultValue={initialValues.state ?? ""}
              aria-label="State"
              aria-required="true"
              autoComplete="address-level1"
              {...errorProps(`${idPrefix}-state-error`, fieldErrors.state)}
            >
              <option value="" disabled>
                State*
              </option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <FieldError id={`${idPrefix}-state-error`} message={fieldErrors.state} />
        </div>
      </div>
      <div className="tf-select mb_20">
        <select name="label" defaultValue={initialValues.label || "Home"} aria-label="Address type">
          {ADDRESS_LABELS.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {showDefaultOption && (
        <div className="tf-cart-checkbox mb_20">
          <div className="tf-checkbox-wrapp">
            <input
              type="checkbox"
              id={`${idPrefix}-default`}
              name="isDefault"
              defaultChecked={Boolean(initialValues.isDefault)}
            />
            <div>
              <i className="icon-check" />
            </div>
          </div>
          <label htmlFor={`${idPrefix}-default`}>Set as default address.</label>
        </div>
      )}
      <FormAlert>{general}</FormAlert>
      <div className="d-flex align-items-center justify-content-center gap-20 flex-wrap">
        <button type="submit" className="tf-btn btn-fill radius-4" disabled={isPending} aria-busy={isPending}>
          <span className="text">{isPending ? "Saving…" : submitLabel}</span>
        </button>
        {onCancel && (
          <button type="button" className="tf-btn btn-fill radius-4 btn-hide-address" onClick={onCancel}>
            <span className="text">Cancel</span>
          </button>
        )}
      </div>
    </form>
  );
}
