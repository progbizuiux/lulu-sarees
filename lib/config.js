// App settings read from .env files.
// NEXT_PUBLIC_* values are baked in at build time, so each one must be written out in full here.

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const mockFlag = process.env.NEXT_PUBLIC_USE_MOCKS;

export const config = {
  apiUrl,
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 15000,
  // An explicit flag wins. Without one, use mocks only when no API URL is set.
  useMocks: mockFlag ? mockFlag === "true" : !apiUrl,
  mockDelay: Number(process.env.NEXT_PUBLIC_MOCK_DELAY ?? 400) || 0,
};
