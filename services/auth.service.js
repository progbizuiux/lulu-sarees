import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";
import { mapAuthResponse, mapUser } from "@/lib/mappers/user.mapper";

const mocks = () => import("@/lib/mocks/auth");

// The backend sets and clears the httpOnly auth cookies. The frontend never sees the tokens.

/** The logged-in user, or null for guests. @returns {Promise<import("@/lib/mappers/user.mapper").User|null>} */
async function me() {
  if (config.useMocks) return (await mocks()).me();
  try {
    return mapUser(unwrap(await apiClient.get(ENDPOINTS.auth.me)));
  } catch (error) {
    if (error.status === 401) return null; // not logged in is a normal state, not an error
    throw error;
  }
}

/** @param {{email: string, password: string}} credentials */
async function login(credentials) {
  if (config.useMocks) return (await mocks()).login(credentials);
  return mapAuthResponse(unwrap(await apiClient.post(ENDPOINTS.auth.login, credentials)));
}

/** @param {{firstName?: string, lastName?: string, email: string, phone?: string, password: string}} details */
async function register(details) {
  if (config.useMocks) return (await mocks()).register(details);
  return mapAuthResponse(unwrap(await apiClient.post(ENDPOINTS.auth.register, details)));
}

async function logout() {
  if (config.useMocks) return (await mocks()).logout();
  await apiClient.post(ENDPOINTS.auth.logout);
}

/** @param {{email: string}} payload */
async function forgotPassword(payload) {
  if (config.useMocks) return (await mocks()).forgotPassword(payload);
  return unwrap(await apiClient.post(ENDPOINTS.auth.forgotPassword, payload));
}

export const authService = { me, login, register, logout, forgotPassword };
