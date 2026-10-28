// Every backend path lives here. When the API docs arrive, update the paths in this file only.
// These are placeholders until the .NET team confirms the real routes.

const id = (value) => encodeURIComponent(String(value));

export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
  },
  products: {
    list: "/products",
    detail: (idOrSlug) => `/products/${id(idOrSlug)}`,
  },
  cart: {
    get: "/cart",
    items: "/cart/items",
    item: (itemId) => `/cart/items/${id(itemId)}`,
    coupon: "/cart/coupon",
    availableCoupons: "/coupons/available",
  },
  wishlist: {
    get: "/wishlist",
    item: (productId) => `/wishlist/${id(productId)}`,
  },
  checkout: {
    summary: "/checkout/summary",
    pincode: "/shipping/check",
  },
  orders: {
    list: "/orders",
    create: "/orders",
    detail: (orderId) => `/orders/${id(orderId)}`,
    track: "/orders/track",
    verifyPayment: "/payments/verify",
  },
  addresses: {
    list: "/addresses",
    create: "/addresses",
    item: (addressId) => `/addresses/${id(addressId)}`,
  },
  newsletter: {
    subscribe: "/newsletter/subscribe",
  },
};
