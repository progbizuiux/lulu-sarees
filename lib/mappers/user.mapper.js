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

  const firstName = api.firstName ?? "";
  const lastName = api.lastName ?? "";

  return {
    id: api.id ?? api.userId,
    firstName,
    lastName,
    name: api.name ?? api.fullName ?? [firstName, lastName].filter(Boolean).join(" "),
    email: api.email ?? "",
    phone: api.phone ?? api.phoneNumber ?? undefined,
  };
}

/** Login/register responses may be the user itself or { user, ... }. */
export const mapAuthResponse = (api) => mapUser(api?.user ?? api);
