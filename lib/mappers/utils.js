export const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

/** Converts to a number; returns the fallback for null, "", or anything not numeric. */
export function num(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const toArray = (value) => (Array.isArray(value) ? value : []);

/** Finds the list inside a response that may be a plain array or { items | data | ... }. */
export function pickList(data, keys = ["items", "data", "results"]) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

/** Removes undefined, null and "" so they aren't sent as query params. */
export function compact(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}
