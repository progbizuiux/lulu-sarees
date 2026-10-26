// Fake auth API. Any valid-looking email and a password of 6+ characters logs in.
// Register with taken@example.com to see the "email already used" error.
import { delay, mockError, readStore, removeStore, writeStore } from "./utils";

const STORE_KEY = "user";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials({ email, password }) {
  const fieldErrors = {};
  if (!EMAIL_PATTERN.test(email || "")) fieldErrors.email = "Enter a valid email address.";
  if (!password || password.length < 6) fieldErrors.password = "Password must be at least 6 characters.";
  if (Object.keys(fieldErrors).length) throw mockError(400, "Please fix the highlighted fields.", fieldErrors);
}

export async function me() {
  await delay();
  return readStore(STORE_KEY, null);
}

export async function login({ email, password }) {
  await delay();
  validateCredentials({ email, password });
  const saved = readStore(STORE_KEY, null);
  const user =
    saved?.email === email
      ? saved
      : { id: 1, firstName: email.split("@")[0], lastName: "", name: email.split("@")[0], email, phone: undefined };
  writeStore(STORE_KEY, user);
  return user;
}

export async function register({ firstName = "", lastName = "", email, phone, password }) {
  await delay();
  validateCredentials({ email, password });
  if (email.toLowerCase() === "taken@example.com") {
    throw mockError(409, "An account with this email already exists.", {
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
  return { sent: true };
}
