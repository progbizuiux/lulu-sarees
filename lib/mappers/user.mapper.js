/**
 * @typedef {Object} User
 * @property {string|number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 */

/** @returns {User|null} */
export function mapUser(api) {
  if (!api) return null;

  // The ERP sends one "name"; the account page shows first and last name separately.
  const fullName = String(api.name ?? api.fullName ?? "").trim();
  const [firstFromName = "", ...restOfName] = fullName.split(/\s+/);
  const firstName = api.firstName ?? firstFromName;
  const lastName = api.lastName ?? restOfName.join(" ");

  return {
    id: api.id ?? api.userId ?? api.email ?? "",
    firstName,
    lastName,
    name: fullName || [firstName, lastName].filter(Boolean).join(" "),
    email: api.email ?? "",
    phone: api.phone ?? api.phoneNumber ?? undefined,
  };
}

/** ERP auth state { isAuthenticated, name, email, phone } -> the user, or null for guests. */
export const mapAuthState = (api) => (api?.isAuthenticated ? mapUser(api) : null);
