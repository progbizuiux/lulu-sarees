// Helpers for the fake backend used while NEXT_PUBLIC_USE_MOCKS=true.
// Mock data is kept in localStorage under its own prefix, separate from the template's "cartList".
import { config } from "@/lib/config";
import { ApiError } from "@/lib/api/errors";

const PREFIX = "lulu-mock:";

// Fake network delay in the browser only: on the server (product pages) it would just slow page loads.
export const delay = (ms = config.mockDelay) =>
  typeof window === "undefined" ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms));

export function readStore(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): mocks keep working for this page view.
  }
}

export function removeStore(key) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

/** Builds the same error the real API layer would throw. */
export const mockError = (status, message, fieldErrors = {}) =>
  new ApiError({ status, message, fieldErrors, code: "MOCK" });

/** Account-only mock endpoints answer 401 for guests, like the real backend will. */
export function requireUser() {
  const user = readStore("user", null);
  if (!user) throw mockError(401, "Please log in to continue.");
  return user;
}

export const roundMoney = (value) => Math.round(value * 100) / 100;
