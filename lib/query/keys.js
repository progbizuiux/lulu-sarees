// Cache keys for React Query, kept in one place so refreshing data after a change is consistent.
export const queryKeys = {
  products: {
    all: ["products"],
    list: (params = {}) => ["products", "list", params],
    detail: (idOrSlug) => ["products", "detail", String(idOrSlug)],
  },
  cart: ["cart"],
  user: ["auth", "me"],
  wishlist: ["wishlist"],
  checkout: {
    all: ["checkout"],
    summary: (params = {}) => ["checkout", "summary", params],
    pincode: (pincode) => ["checkout", "pincode", String(pincode)],
  },
  orders: {
    all: ["orders"],
    list: ["orders", "list"],
    detail: (orderId) => ["orders", "detail", String(orderId)],
  },
};
