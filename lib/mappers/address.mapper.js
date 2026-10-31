// Converts ERP addresses to the shape the UI uses, and form values to what the ERP expects.
// ERP address: { addressID, name, mobileNumber, alternateMobileNumber, addressLine1, addressLine2,
// landmark, city, pincode, stateID, stateName, countryID, countryName, addressType (1 Home, 2 Office), isDefault }
import { pickList } from "./utils";

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
 * @property {string} [landmark]
 * @property {string} city
 * @property {string} state
 * @property {string} pincode
 * @property {string} country
 * @property {boolean} isDefault
 */

const TYPE_LABELS = { 1: "Home", 2: "Work" };

/** @returns {Address|null} */
export function mapAddress(api) {
  if (!api) return null;
  // Order details may send the address as one line of text.
  if (typeof api === "string") {
    return { id: "", label: "", firstName: "", lastName: "", name: "", phone: "", line1: api, line2: "", landmark: "", city: "", state: "", pincode: "", country: "", isDefault: false };
  }
  const fullName = String(api.name ?? api.fullName ?? "").trim();
  const [firstFromName = "", ...restOfName] = fullName.split(/\s+/);
  const firstName = api.firstName ?? firstFromName;
  const lastName = api.lastName ?? restOfName.join(" ");
  return {
    id: api.addressID ?? api.id ?? api.addressId,
    label: TYPE_LABELS[api.addressType] ?? api.label ?? api.title ?? "",
    firstName,
    lastName,
    name: fullName || [firstName, lastName].filter(Boolean).join(" "),
    phone: api.mobileNumber ?? api.phone ?? api.phoneNumber ?? api.mobile ?? "",
    line1: api.addressLine1 ?? api.line1 ?? api.street ?? "",
    line2: api.addressLine2 ?? api.line2 ?? "",
    landmark: api.landmark ?? "",
    city: api.city ?? "",
    state: api.stateName ?? api.state ?? "",
    pincode: String(api.pincode ?? api.postalCode ?? api.zip ?? ""),
    country: api.countryName ?? api.country ?? "India",
    isDefault: Boolean(api.isDefault ?? api.default ?? false),
  };
}

export const mapAddressList = (data) => pickList(data, ["items", "data", "addresses"]).map(mapAddress);

/**
 * Form values -> POST save-address body. The form picks the state by name; the service passes the
 * matching ERP ids (stateID, countryID). The ERP has Home and Office only, so "Other" is saved as Home.
 */
export const mapAddressInput = (values, { addressId = 0, stateId, countryId }) => ({
  addressID: addressId,
  name: [values.firstName, values.lastName].filter(Boolean).join(" "),
  mobileNumber: values.phone,
  addressLine1: values.line1,
  addressLine2: values.line2 || null,
  landmark: values.landmark || null,
  city: values.city,
  pincode: values.pincode,
  stateID: stateId,
  countryID: countryId,
  addressType: values.label === "Work" ? 2 : 1,
  isDefault: Boolean(values.isDefault),
});
