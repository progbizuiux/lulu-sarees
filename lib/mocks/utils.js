// Helpers for the fake backend used while NEXT_PUBLIC_USE_MOCKS=true.
// Mock data is kept in localStorage under its own prefix, separate from the template's "cartList".
import { config } from "@/lib/config";
import { ApiError } from "@/lib/api/errors";

const PREFIX = "lulu-mock:";

export const delay = (ms = config.mockDelay) => new Promise((resolve) => setTimeout(resolve, ms));

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

export const roundMoney = (value) => Math.round(value * 100) / 100;
