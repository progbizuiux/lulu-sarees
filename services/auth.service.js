import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapAuthState } from "@/lib/mappers/user.mapper";

const mocks = () => import("@/lib/mocks/auth");

// The ERP sets and clears the HttpOnly login cookie (pb_store). The frontend never sees it.

/** The logged-in user, or null for guests. @returns {Promise<import("@/lib/mappers/user.mapper").User|null>} */
async function me() {
  if (config.useMocks) return (await mocks()).me();
  try {
    return mapAuthState(unwrap(await apiClient.get(ENDPOINTS.auth.me)));
  } catch (error) {
    if (error.status === 401) return null; // not logged in is a normal state, not an error
    throw error;
  }
}

/** @param {{login: string, password: string, rememberMe?: boolean}} credentials  login = email or mobile */
async function login({ login, password, rememberMe = false }) {
  if (config.useMocks) return (await mocks()).login({ login, password });
  return mapAuthState(unwrap(await apiClient.post(ENDPOINTS.auth.login, { login, password, rememberMe })));
}

/** @param {{firstName: string, lastName?: string, email: string, phone: string, password: string}} details */
async function register({ firstName, lastName = "", email, phone, password }) {
  if (config.useMocks) return (await mocks()).register({ firstName, lastName, email, phone, password });
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return mapAuthState(
    unwrap(await apiClient.post(ENDPOINTS.auth.register, { name, email, phone, password, rememberMe: true }))
  );
}

async function logout() {
  if (config.useMocks) return (await mocks()).logout();
  await apiClient.post(ENDPOINTS.auth.logout, {});
}

/** @param {{email: string}} payload  The ERP gives the same answer whether or not the email has an account. */
async function forgotPassword({ email }) {
  if (config.useMocks) return (await mocks()).forgotPassword({ email });
  return unwrap(await apiClient.post(ENDPOINTS.auth.forgotPassword, { email }));
}

/** @param {{token: string, newPassword: string}} payload  token comes from the reset email link. */
async function resetPassword({ token, newPassword }) {
  if (config.useMocks) return (await mocks()).resetPassword({ token, newPassword });
  return unwrap(await apiClient.post(ENDPOINTS.auth.resetPassword, { token, newPassword }));
}

export const authService = { me, login, register, logout, forgotPassword, resetPassword };
