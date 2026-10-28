import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";

const mocks = () => import("@/lib/mocks/newsletter");

/** Adds an email address to the newsletter list (footer form and the home page popup). */
async function subscribe(email) {
  if (config.useMocks) return (await mocks()).subscribe(email);
  return unwrap(await apiClient.post(ENDPOINTS.newsletter.subscribe, { email }));
}

export const newsletterService = { subscribe };
