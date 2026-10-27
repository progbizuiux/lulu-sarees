// Where to send the user after login, taken from ?redirect=...
// Only our own pages are allowed. This blocks "open redirects" like
// ?redirect=https://evil.com, //evil.com or /\evil.com, which could be used for phishing.

const SAFE_PATH = /^\/(?![/\\])[^\s\\\x00-\x1f]*$/;

export const DEFAULT_AFTER_LOGIN = "/my-account";

export function safeRedirect(value, fallback = DEFAULT_AFTER_LOGIN) {
  return typeof value === "string" && SAFE_PATH.test(value) ? value : fallback;
}

/** Reads ?redirect= from the current URL (browser only). */
export function getRedirectParam(fallback = DEFAULT_AFTER_LOGIN) {
  if (typeof window === "undefined") return fallback;
  return safeRedirect(new URLSearchParams(window.location.search).get("redirect"), fallback);
}

/** Login page URL that returns the user to `returnTo` afterwards. */
export const loginUrl = (returnTo) => `/login?redirect=${encodeURIComponent(safeRedirect(returnTo, "/"))}`;
