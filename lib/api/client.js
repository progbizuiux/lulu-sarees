import axios from "axios";
import { config } from "@/lib/config";
import { ENDPOINTS } from "./endpoints";
import { ApiError, normalizeError } from "./errors";

/**
 * The one axios instance for the whole app.
 * Auth uses httpOnly cookies set by the backend, so the frontend never reads or stores tokens.
 */
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  withCredentials: true, // send the auth cookies with every request
  headers: { Accept: "application/json" },
  // Matches ASP.NET Core anti-forgery defaults, in case the backend turns CSRF protection on.
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

/**
 * Pulls the payload out of a response.
 * If the backend wraps everything (e.g. { success, data, message }), change this one line
 * to `response.data?.data`.
 */
export const unwrap = (response) => response.data;

// ---- Session expiry: lets the app clear the logged-in user when the session can't be refreshed.
const sessionExpiredListeners = new Set();

export function onSessionExpired(listener) {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function notifySessionExpired() {
  sessionExpiredListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // One broken listener must not stop the others.
    }
  });
}

// ---- Token refresh: when the short-lived access cookie expires, get a new one once and retry.
const NO_REFRESH_PATHS = [
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.register,
  ENDPOINTS.auth.refresh,
  ENDPOINTS.auth.logout,
];

let refreshPromise = null;

// Many requests can fail with 401 at the same time; they all wait for the same refresh call.
function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(ENDPOINTS.auth.refresh, null, {
        baseURL: config.apiUrl,
        timeout: config.apiTimeout,
        withCredentials: true,
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.request.use((request) => {
  if (!request.baseURL && !/^https?:\/\//.test(request.url ?? "")) {
    throw new ApiError({
      message: "NEXT_PUBLIC_API_URL is not set. Add it to .env.local or set NEXT_PUBLIC_USE_MOCKS=true.",
      code: "CONFIG",
    });
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config;
    const canRefresh =
      error?.response?.status === 401 &&
      original &&
      !original._retried &&
      !original.skipAuthRefresh &&
      !NO_REFRESH_PATHS.some((path) => original.url?.startsWith(path));

    if (canRefresh) {
      original._retried = true;
      try {
        await refreshSession();
        return apiClient(original);
      } catch {
        notifySessionExpired();
      }
    }

    return Promise.reject(normalizeError(error));
  }
);
