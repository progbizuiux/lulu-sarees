import axios from "axios";
import { config } from "@/lib/config";
import { ENDPOINTS } from "./endpoints";
import { normalizeError } from "./errors";

const isServer = typeof window === "undefined";

/**
 * The one axios instance for the whole app.
 * - In the browser: calls go to our own server (relative URLs), which forwards them to the ERP with
 *   the shop key. Login is an HttpOnly cookie (pb_store), so the frontend never reads or stores tokens.
 * - On our server (shop, product and home pages load their first products there): calls go straight
 *   to the ERP with the shop key. ERP_API_URL and ERP_STORE_KEY are server-only settings; in the
 *   browser they are undefined, so the key can never end up in browser code.
 */
export const apiClient = axios.create({
  baseURL: isServer
    ? `${(process.env.ERP_API_URL || "").replace(/\/+$/, "")}${config.apiBasePath}`
    : config.apiBasePath,
  timeout: config.apiTimeout,
  withCredentials: true, // send the login/cart cookies with every request
  headers: { Accept: "application/json" },
});

if (isServer) {
  apiClient.interceptors.request.use((request) => {
    request.headers["X-Storefront-Key"] = process.env.ERP_STORE_KEY ?? "";
    // The ERP answers 500 to "Accept-Language: *"; always send a real language.
    request.headers["Accept-Language"] = "en-IN";
    return request;
  });
}

/** Pulls the payload out of a response. The ERP sends the data itself, not wrapped. */
export const unwrap = (response) => response.data;

// ---- Session ended: lets the app clear the logged-in user when the ERP answers 401.
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

// A wrong password on these is a normal 400/401, not an ended session.
const AUTH_PATHS = [ENDPOINTS.auth.login, ENDPOINTS.auth.register, ENDPOINTS.auth.logout];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // The ERP has no token refresh: 401 means "not logged in" or "session ended".
    const url = error?.config?.url ?? "";
    if (!isServer && error?.response?.status === 401 && !AUTH_PATHS.some((path) => url.startsWith(path))) {
      notifySessionExpired();
    }
    return Promise.reject(normalizeError(error));
  }
);
