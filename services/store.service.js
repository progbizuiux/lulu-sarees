import { apiClient, unwrap } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { config } from "@/lib/config";

/**
 * @typedef {Object} StoreConfig   what the shop allows (ERP get-store-config)
 * @property {string} name
 * @property {string} currencySymbol
 * @property {boolean} allowGuestCheckout
 * @property {boolean} allowCOD
 * @property {number|null} codMaxAmount
 * @property {number|null} codCharge
 * @property {number|null} freeDeliveryAbove
 * @property {boolean} reviewsEnabled
 * @property {string|null} supportEmail
 * @property {string|null} supportPhone
 */

// Demo data follows the old mock rules (guest checkout and COD on).
const MOCK_CONFIG = {
  name: "Lulu Sarees",
  currencySymbol: "₹",
  allowGuestCheckout: true,
  allowCOD: true,
  codMaxAmount: 10000,
  codCharge: 40,
  freeDeliveryAbove: 999,
  reviewsEnabled: true,
  supportEmail: null,
  supportPhone: null,
};

/** GET get-store-config @returns {Promise<StoreConfig>} */
async function getConfig() {
  if (config.useMocks) return MOCK_CONFIG;
  const api = unwrap(await apiClient.get(ENDPOINTS.store.config));
  return {
    name: api.name ?? "Lulu Sarees",
    currencySymbol: api.currencySymbol ?? "₹",
    allowGuestCheckout: Boolean(api.allowGuestCheckout),
    allowCOD: Boolean(api.allowCOD),
    codMaxAmount: api.codMaxAmount ?? null,
    codCharge: api.codCharge ?? null,
    freeDeliveryAbove: api.freeDeliveryAbove ?? null,
    reviewsEnabled: Boolean(api.reviewsEnabled),
    supportEmail: api.supportEmail ?? null,
    supportPhone: api.supportPhone ?? null,
  };
}

export const storeService = { getConfig };
