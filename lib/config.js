// App settings read from .env files.
// NEXT_PUBLIC_* values are baked in at build time, so each one must be written out in full here.

const mockFlag = process.env.NEXT_PUBLIC_USE_MOCKS;
// Demo data unless NEXT_PUBLIC_USE_MOCKS=false.
const useMocks = mockFlag !== "false";

export const config = {
  // The browser always calls our own server, which forwards to the ERP and adds the shop key
  // (app/api/Ecommerce/store/[...path]/route.js). The ERP address is server-only: ERP_API_URL.
  apiBasePath: "/api/Ecommerce/store",
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 15000,
  useMocks,
  mockDelay: Number(process.env.NEXT_PUBLIC_MOCK_DELAY ?? 400) || 0,
  // Features the ERP doesn't have yet (ERP handover, "Not available yet"). They stay visible with
  // demo data so the design can be reviewed, and are hidden on the real API.
  features: {
    coupons: useMocks,
    pincodeCheck: useMocks, // the ERP checks the address itself in get-checkout-summary
    orderNote: useMocks, // create-order-from-cart has no note field
  },
};
