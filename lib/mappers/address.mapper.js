// Converts backend addresses to the shape the UI uses, and form values to what the backend expects.
// Field names on the backend side are guesses until the API docs arrive.
import { compact, pickList } from "./utils";

/**
 * @typedef {Object} Address
 * @property {string|number} id
 * @property {string} label       "Home", "Work"…
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} name
 * @property {string} phone
 * @property {string} line1       house number, street
 * @property {string} [line2]     area, landmark
 * @property {string} city
 * @property {string} state
 * @property {string} pincode
 * @property {string} country
 * @property {boolean} isDefault
 */

/** @returns {Address|null} */
export function mapAddress(api) {
  if (!api) return null;
  const firstName = api.firstName ?? "";
  const lastName = api.lastName ?? "";
  return {
    id: api.id ?? api.addressId,
    label: api.label ?? api.title ?? api.addressType ?? "",
    firstName,
    lastName,
    name: api.name ?? api.fullName ?? [firstName, lastName].filter(Boolean).join(" "),
    phone: api.phone ?? api.phoneNumber ?? api.mobile ?? "",
    line1: api.line1 ?? api.addressLine1 ?? api.street ?? "",
    line2: api.line2 ?? api.addressLine2 ?? api.landmark ?? "",
    city: api.city ?? "",
    state: api.state ?? "",
    pincode: String(api.pincode ?? api.postalCode ?? api.zip ?? ""),
    country: api.country ?? "India",
    isDefault: Boolean(api.isDefault ?? api.default ?? false),
  };
}

export const mapAddressList = (data) => pickList(data, ["items", "data", "addresses"]).map(mapAddress);

/** Form values -> request body. */
export const mapAddressInput = (values) =>
  compact({
    label: values.label,
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
    line1: values.line1,
    line2: values.line2,
    city: values.city,
    state: values.state,
    pincode: values.pincode,
    country: values.country ?? "India",
    isDefault: values.isDefault,
  });
