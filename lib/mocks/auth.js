// Fake auth API, following the ERP rules: log in with an email or a 10-digit mobile number;
// passwords are 8+ characters on sign-up and reset.
// Register with taken@example.com to see the "email already used" error.
// Reset password with the token "expired" to see the "link expired" error.
import { delay, mockError, readStore, removeStore, writeStore } from "./utils";

const STORE_KEY = "user";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const PASSWORD_MIN = 8;

const passwordError = (password) =>
  !password || password.length < PASSWORD_MIN ? `Password must be at least ${PASSWORD_MIN} characters.` : null;

export async function me() {
  await delay();
  return readStore(STORE_KEY, null);
}

/** login = email or mobile number. */
export async function login({ login, password }) {
  await delay();
  const value = String(login || "").trim();
  const isEmail = EMAIL_PATTERN.test(value);
  if (!isEmail && !MOBILE_PATTERN.test(value)) {
    throw mockError(400, "Enter a valid email or mobile number.", { login: "Enter a valid email or mobile number." });
  }
  if (!password) throw mockError(400, "Enter your password.", { password: "Enter your password." });

  const saved = readStore(STORE_KEY, null);
  const matchesSaved = saved && (isEmail ? saved.email === value : saved.phone === value);
  const user = matchesSaved
    ? saved
    : isEmail
      ? { id: 1, firstName: value.split("@")[0], lastName: "", name: value.split("@")[0], email: value, phone: undefined }
      : { id: 1, firstName: "Customer", lastName: "", name: "Customer", email: "", phone: value };
  writeStore(STORE_KEY, user);
  return user;
}

export async function register({ firstName = "", lastName = "", email, phone, password }) {
  await delay();
  const fieldErrors = {};
  if (!EMAIL_PATTERN.test(email || "")) fieldErrors.email = "Enter a valid email address.";
  if (!MOBILE_PATTERN.test(phone || "")) fieldErrors.phone = "Enter a valid 10-digit mobile number.";
  if (passwordError(password)) fieldErrors.password = passwordError(password);
  if (Object.keys(fieldErrors).length) throw mockError(400, "Please fix the highlighted fields.", fieldErrors);

  if (email.toLowerCase() === "taken@example.com") {
    throw mockError(400, "An account with this email already exists.", {
      email: "An account with this email already exists.",
    });
  }
  const user = { id: 1, firstName, lastName, name: [firstName, lastName].filter(Boolean).join(" "), email, phone };
  writeStore(STORE_KEY, user);
  return user;
}

export async function logout() {
  await delay(150);
  removeStore(STORE_KEY);
}

export async function forgotPassword({ email }) {
  await delay();
  if (!EMAIL_PATTERN.test(email || "")) {
    throw mockError(400, "Enter a valid email address.", { email: "Enter a valid email address." });
  }
  return { message: "If an account exists for this email, a reset link has been sent." };
}

export async function resetPassword({ token, newPassword }) {
  await delay();
  if (!token || token === "expired") {
    throw mockError(400, "This reset link has expired or was already used. Please request a new one.");
  }
  if (passwordError(newPassword)) throw mockError(400, passwordError(newPassword), { password: passwordError(newPassword) });
  return { message: "Your password has been changed. Please log in." };
}
