import { ApiError } from "@/lib/api/errors";
import { config } from "@/lib/config";

const mocks = () => import("@/lib/mocks/newsletter");

/**
 * Adds an email address to the newsletter list (footer form and the home page popup).
 * The ERP has no newsletter sign-up yet (handover, "Not available yet").
 */
async function subscribe(email) {
  if (config.useMocks) return (await mocks()).subscribe(email);
  throw new ApiError({ message: "Newsletter sign-up isn't available yet. Please check back soon.", status: 400 });
}

export const newsletterService = { subscribe };
