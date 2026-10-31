// Quick checks before a form is sent, so users get instant feedback.
// The backend validates again; its errors are shown the same way.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(email) {
  if (!email) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

/** Each validator returns { fieldName: "message" }; empty means valid. */
const collect = (checks) =>
  Object.fromEntries(Object.entries(checks).filter(([, message]) => Boolean(message)));

/** Login takes an email or a mobile number (ERP: { login }). */
export function validateLogin({ login, password }) {
  let loginError = null;
  if (!login) loginError = "Enter your email or mobile number.";
  else if (!EMAIL_PATTERN.test(login) && !normalizeIndianMobile(login)) {
    loginError = "Enter a valid email or 10-digit mobile number.";
  }
  // No length rule on login: older accounts may have shorter passwords.
  return collect({
    login: loginError,
    password: password ? null : "Enter your password.",
  });
}

function validateNewPassword(password) {
  if (!password) return "Enter a password.";
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  return null;
}

export function validateResetPassword({ password, confirmPassword }) {
  return collect({
    password: validateNewPassword(password),
    confirmPassword: confirmPassword === password ? null : "Passwords don't match.",
  });
}

export const NAME_MAX_LENGTH = 50;

function validateName(value, { required, label }) {
  if (!value) return required ? `Enter your ${label}.` : null;
  if (value.length > NAME_MAX_LENGTH) return `${label[0].toUpperCase()}${label.slice(1)} is too long.`;
  return null;
}

export function validateRegister({ firstName, lastName, email, phone, password, confirmPassword, agree }) {
  return collect({
    // Last name is optional: many customers go by a single name.
    firstName: validateName(firstName, { required: true, label: "first name" }),
    lastName: validateName(lastName, { required: false, label: "last name" }),
    email: validateEmail(email),
    phone: validatePhone(phone),
    password: validateNewPassword(password),
    confirmPassword: confirmPassword === password ? null : "Passwords don't match.",
    agree: agree ? null : "Please accept the Terms of Use to continue.",
  });
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;

// ---- Indian phone numbers and pincodes

/** "+91 98765 43210", "098765-43210" -> "9876543210". Returns "" if it isn't a valid Indian mobile. */
export function normalizeIndianMobile(value) {
  const digits = String(value ?? "").replace(/[\s\-()]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : "";
}

export function validatePhone(phone) {
  if (!phone) return "Enter your mobile number.";
  if (!normalizeIndianMobile(phone)) return "Enter a valid 10-digit mobile number.";
  return null;
}

export function validatePincode(pincode) {
  if (!pincode) return "Enter your pincode.";
  if (!/^[1-9]\d{5}$/.test(String(pincode).trim())) return "Enter a valid 6-digit pincode.";
  return null;
}

const ADDRESS_LINE_MAX = 120;

export function validateAddress({ firstName, lastName, phone, line1, line2, city, state, pincode }) {
  const tooLong = (value, label) =>
    value && value.length > ADDRESS_LINE_MAX ? `${label} is too long.` : null;

  return collect({
    firstName: validateName(firstName, { required: true, label: "first name" }),
    lastName: validateName(lastName, { required: false, label: "last name" }),
    phone: validatePhone(phone),
    line1: line1 ? tooLong(line1, "Address") : "Enter your house number and street.",
    line2: tooLong(line2, "Address"),
    city: city ? tooLong(city, "City") : "Enter your city.",
    state: state ? null : "Choose your state.",
    pincode: validatePincode(pincode),
  });
}

/** Order tracking: the order number plus the email or phone used on the order. */
/** Order tracking: order number + the mobile number on the order (ERP track-order?orderNo=&phone=). */
export function validateTrackOrder({ orderNumber, contact }) {
  let contactError = null;
  if (!contact) contactError = "Enter the mobile number used for the order.";
  else if (!normalizeIndianMobile(contact)) contactError = "Enter a valid 10-digit mobile number.";
  return collect({
    orderNumber: orderNumber ? null : "Enter your order number.",
    contact: contactError,
  });
}
