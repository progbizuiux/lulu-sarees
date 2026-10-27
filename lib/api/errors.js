import axios from "axios";

const MESSAGES = {
  network: "Can't reach the server. Check your internet connection and try again.",
  timeout: "The server is taking too long to respond. Please try again.",
  server: "Something went wrong on our side. Please try again in a moment.",
  fallback: "Something went wrong. Please try again.",
};

/**
 * The one error shape every page sees, whatever the backend sent.
 * - message:     safe to show to the user
 * - status:      HTTP status (0 = no response: offline, timeout, CORS)
 * - fieldErrors: { email: "Email is required" } for highlighting form fields
 */
export class ApiError extends Error {
  constructor({ message, status = 0, code = null, fieldErrors = {}, data = null, cause } = {}) {
    super(message || MESSAGES.fallback, cause ? { cause } : undefined);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.data = data;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isValidationError() {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

// "Email" -> "email", "Address.Pincode" -> "address.pincode" (.NET sends PascalCase names)
const toFieldName = (key) =>
  key
    .split(".")
    .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
    .join(".");

// Supports the ASP.NET format { Email: ["msg"] } and a list format [{ field, message }].
function readFieldErrors(errors) {
  if (!errors || typeof errors !== "object") return {};

  if (Array.isArray(errors)) {
    return errors.reduce((result, item) => {
      const field = item?.field ?? item?.propertyName;
      const message = item?.message ?? item?.errorMessage;
      if (field && message) result[toFieldName(field)] = message;
      return result;
    }, {});
  }

  return Object.entries(errors).reduce((result, [key, value]) => {
    const message = Array.isArray(value) ? value[0] : value;
    if (message) result[toFieldName(key)] = String(message);
    return result;
  }, {});
}

/** Turns any thrown value (axios error, bug, timeout) into an ApiError. */
export function normalizeError(error) {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError({ message: "Request cancelled", code: "CANCELLED", cause: error });
  }

  if (!axios.isAxiosError(error)) {
    return new ApiError({ message: MESSAGES.fallback, code: "UNKNOWN", cause: error });
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return new ApiError({ message: MESSAGES.timeout, code: "TIMEOUT", cause: error });
  }

  const response = error.response;
  if (!response) {
    return new ApiError({ message: MESSAGES.network, code: "NETWORK", cause: error });
  }

  const { status, data } = response;
  const body = data && typeof data === "object" ? data : {};
  const fieldErrors = readFieldErrors(body.errors);

  // Never show server crash details (stack traces) to customers.
  let message;
  if (status >= 500) {
    message = body.message || MESSAGES.server;
  } else {
    const text = typeof data === "string" && data.length < 200 ? data : null;
    message = body.message || body.detail || body.title || text || MESSAGES.fallback;
  }

  return new ApiError({
    message,
    status,
    code: body.code ?? body.errorCode ?? null,
    fieldErrors,
    data,
    cause: error,
  });
}
